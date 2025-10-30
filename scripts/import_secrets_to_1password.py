#!/usr/bin/env python3
"""
Import all existing secrets from GitHub, Render, Supabase, etc. to 1Password
Creates a complete inventory and backup of all secrets before rotation
"""

import json
import subprocess
import sys
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import os

@dataclass
class SecretInfo:
    name: str
    source: str  # github, render, supabase, mailgun, etc.
    value: Optional[str] = None  # Will be None for GitHub (can't retrieve values)
    service_id: Optional[str] = None  # Service ID for Render
    notes: str = ""
    
class SecretsImporter:
    def __init__(self, vault: str = "Intellicore Ops", dry_run: bool = False):
        self.vault = vault
        self.dry_run = dry_run
        self.secrets: List[SecretInfo] = []
        
    def run_command(self, cmd: List[str], capture_output=True) -> subprocess.CompletedProcess:
        """Run shell command and return result"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture_output,
                text=True,
                check=True
            )
            return result
        except subprocess.CalledProcessError as e:
            print(f"❌ Command failed: {' '.join(cmd)}")
            print(f"   Error: {e.stderr}")
            raise
    
    def list_github_secrets(self, repo: str) -> List[SecretInfo]:
        """List GitHub repository secrets (names only - values are encrypted)"""
        print(f"📦 Listing GitHub Secrets from {repo}...")
        
        try:
            result = self.run_command(['gh', 'secret', 'list', '--repo', repo, '--json', 'name,updatedAt'])
            secrets_data = json.loads(result.stdout)
            
            secrets = []
            for item in secrets_data:
                secret = SecretInfo(
                    name=item['name'],
                    source='github',
                    notes=f"Last updated: {item.get('updatedAt', 'unknown')}\nSource: GitHub Actions Secrets"
                )
                secrets.append(secret)
                print(f"  ✓ Found: {secret.name}")
            
            return secrets
        except Exception as e:
            print(f"⚠️  Failed to list GitHub secrets: {e}")
            return []
    
    def list_render_env_vars(self, api_key: str) -> List[SecretInfo]:
        """List Render service environment variables"""
        print(f"🚀 Listing Render environment variables...")
        
        try:
            # Get all services
            result = self.run_command([
                'curl', '-s',
                '-H', f'Authorization: Bearer {api_key}',
                'https://api.render.com/v1/services'
            ])
            
            services = json.loads(result.stdout)
            if not isinstance(services, list):
                print(f"⚠️  Unexpected Render API response: {services}")
                return []
            
            secrets = []
            for service in services:
                service_id = service.get('service', {}).get('id')
                service_name = service.get('service', {}).get('name')
                
                if not service_id:
                    continue
                
                print(f"  📋 Service: {service_name} ({service_id})")
                
                # Get env vars for this service
                env_result = self.run_command([
                    'curl', '-s',
                    '-H', f'Authorization: Bearer {api_key}',
                    f'https://api.render.com/v1/services/{service_id}/env-vars'
                ])
                
                env_vars = json.loads(env_result.stdout)
                for env_var in env_vars:
                    key = env_var.get('envVar', {}).get('key')
                    value = env_var.get('envVar', {}).get('value')
                    
                    if key:
                        secret = SecretInfo(
                            name=f"RENDER_{service_name.upper()}_{key}",
                            source='render',
                            value=value,
                            service_id=service_id,
                            notes=f"Service: {service_name}\nService ID: {service_id}\nOriginal key: {key}"
                        )
                        secrets.append(secret)
                        print(f"    ✓ {key}")
            
            return secrets
        except Exception as e:
            print(f"⚠️  Failed to list Render env vars: {e}")
            return []
    
    def import_to_1password(self, secret: SecretInfo) -> bool:
        """Import a secret to 1Password"""
        item_title = f"{secret.source.upper()} - {secret.name}"
        
        if self.dry_run:
            print(f"  [DRY RUN] Would create: {item_title}")
            return True
        
        try:
            # Check if item exists
            check_result = self.run_command(
                ['op', 'item', 'list', '--vault', self.vault, '--format', 'json'],
                capture_output=True
            )
            existing_items = json.loads(check_result.stdout)
            existing_item = next((item for item in existing_items if item['title'] == item_title), None)
            
            if existing_item:
                print(f"  ℹ️  Item already exists: {item_title} - Skipping")
                return True
            
            # Create item
            if secret.value:
                # Create with password field
                create_cmd = [
                    'op', 'item', 'create',
                    '--category=login',
                    f'--title={item_title}',
                    f'--vault={self.vault}',
                    f'password={secret.value}',
                    f'notesPlain={secret.notes}'
                ]
            else:
                # Create with notes only (for GitHub secrets where we don't have values)
                notes = f"{secret.notes}\n\nNote: Value not available from source API. Must be set manually or via sync from existing deployment."
                create_cmd = [
                    'op', 'item', 'create',
                    '--category=login',
                    f'--title={item_title}',
                    f'--vault={self.vault}',
                    f'notesPlain={notes}'
                ]
            
            self.run_command(create_cmd)
            print(f"  ✅ Created: {item_title}")
            return True
            
        except Exception as e:
            print(f"  ❌ Failed to import {item_title}: {e}")
            return False
    
    def generate_inventory_report(self, output_file: str = "secrets-inventory.json"):
        """Generate JSON inventory report"""
        inventory = {
            "total_secrets": len(self.secrets),
            "by_source": {},
            "secrets": [asdict(s) for s in self.secrets]
        }
        
        # Count by source
        for secret in self.secrets:
            inventory["by_source"][secret.source] = inventory["by_source"].get(secret.source, 0) + 1
        
        with open(output_file, 'w') as f:
            json.dump(inventory, f, indent=2)
        
        print(f"\n📊 Inventory Report")
        print(f"   Total secrets: {inventory['total_secrets']}")
        for source, count in inventory["by_source"].items():
            print(f"   {source.upper()}: {count}")
        print(f"   Report saved to: {output_file}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Import secrets from various services to 1Password')
    parser.add_argument('--repo', default='contatohb/Intellicore', help='GitHub repository (owner/repo)')
    parser.add_argument('--vault', default='Intellicore Ops', help='1Password vault name')
    parser.add_argument('--render-api-key', help='Render API key (or set RENDER_API_KEY env var)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be imported without actually importing')
    parser.add_argument('--skip-github', action='store_true', help='Skip GitHub secrets import')
    parser.add_argument('--skip-render', action='store_true', help='Skip Render import')
    parser.add_argument('--output', default='secrets-inventory.json', help='Output file for inventory report')
    
    args = parser.parse_args()
    
    # Get Render API key
    render_api_key = args.render_api_key or os.getenv('RENDER_API_KEY')
    
    importer = SecretsImporter(vault=args.vault, dry_run=args.dry_run)
    
    print("🔐 Secrets Import to 1Password")
    print("=" * 50)
    print(f"Vault: {args.vault}")
    print(f"Dry run: {args.dry_run}")
    print()
    
    # Import GitHub secrets
    if not args.skip_github:
        github_secrets = importer.list_github_secrets(args.repo)
        importer.secrets.extend(github_secrets)
        print(f"✓ Found {len(github_secrets)} GitHub secrets\n")
    
    # Import Render env vars
    if not args.skip_render and render_api_key:
        render_secrets = importer.list_render_env_vars(render_api_key)
        importer.secrets.extend(render_secrets)
        print(f"✓ Found {len(render_secrets)} Render env vars\n")
    elif not args.skip_render:
        print("⚠️  Skipping Render: No API key provided (use --render-api-key or RENDER_API_KEY env var)\n")
    
    # TODO: Add other services (Supabase, Mailgun, Mercado Pago, Google Workspace)
    # These will require API credentials for each service
    
    # Import to 1Password
    if importer.secrets:
        print(f"\n📥 Importing {len(importer.secrets)} secrets to 1Password...")
        print()
        
        success_count = 0
        for secret in importer.secrets:
            if importer.import_to_1password(secret):
                success_count += 1
        
        print(f"\n✅ Successfully imported {success_count}/{len(importer.secrets)} secrets")
    else:
        print("\n⚠️  No secrets found to import")
    
    # Generate report
    if not args.dry_run and importer.secrets:
        importer.generate_inventory_report(args.output)
    
    print("\n🎉 Import complete!")
    print("\nNext steps:")
    print("1. Review imported items in 1Password vault")
    print("2. For GitHub secrets (no values), manually copy values if needed")
    print("3. Add credentials for other services (Supabase, Mailgun, etc.)")
    print("4. Run weekly rotation workflow to keep everything in sync")

if __name__ == '__main__':
    main()
