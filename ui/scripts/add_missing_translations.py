#!/usr/bin/env python3

import re
import sys
from pathlib import Path
import typing

# Configuration
LOCALES_PATH = "src/locales"
DEFAULT_LOCALE = "en.ts"
NON_DEFAULT_LOCALES = ["nl.ts"]  # Add more non-default locales here if needed

# ANSI color codes for output formatting
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"


def extract_translation_keys(file_path):
    """Extract all translation keys from the locale file."""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern to match translation keys: key: 'value' or key: (params) => `...`
    pattern = r"^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:"

    keys = []
    for line in content.splitlines():
        match = re.match(pattern, line)
        if match:
            key = match.group(1)
            keys.append(key)

    return keys


def get_file_content(file_path):
    """Read the file content."""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def add_missing_keys(default_keys, target_file_path):
    """Add missing keys to a target locale file in alphabetical order among existing keys."""
    target_content = get_file_content(target_file_path)
    target_keys = extract_translation_keys(target_file_path)

    # Find missing keys
    missing_keys = [key for key in default_keys if key not in target_keys]

    if not missing_keys:
        print(f"{GREEN}No missing keys in {target_file_path.name}{RESET}")
        return 0

    if "}" in target_content:
        content_lines = target_content.splitlines()

        # Find the definition block start and end
        start_line = end_line = None
        for i, line in enumerate(content_lines):
            if ("export default" in line and "{" in line) or ("export const dict" in line and "{" in line):
                start_line = i
            elif "}" in line and (start_line is not None):
                end_line = i
                break

        if start_line is None or end_line is None:
            print(
                f"{RED}Could not find the translation object in {target_file_path.name}{RESET}"
            )
            return 0

        # Get the indentation from an existing line
        indentation = ""
        for line in content_lines:
            if re.match(r"^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:", line):
                indentation = re.match(r"^(\s*)", line).group(1)
                break

        # Extract existing key entries with their start and end line numbers
        key_entries = []
        i = start_line + 1
        while i < end_line:
            line = content_lines[i]
            match = re.match(r"^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:", line)
            if match:
                key = match.group(1)
                
                # Find where this entry ends (next key or end of object)
                entry_lines = [line]
                entry_start = i
                j = i + 1
                
                # Look ahead for the next key or the end of the object
                while j < end_line:
                    next_line = content_lines[j]
                    if re.match(r"^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:", next_line):
                        # Found next key
                        break
                    entry_lines.append(next_line)
                    j += 1
                
                entry_end = j - 1
                key_entries.append((key, entry_start, entry_end, entry_lines))
                i = j  # Move to the next key or end
            else:
                i += 1  # Move to the next line
                
        # Sort all keys (existing + missing)
        all_keys = sorted(set(target_keys + missing_keys))

        # Build new content with keys in alphabetical order
        new_lines = content_lines[: start_line + 1]  # Include everything up to the start of object

        for i, key in enumerate(all_keys):
            if key in target_keys:
                # Find the entry for this key
                for entry_key, _, _, entry_lines in key_entries:
                    if entry_key == key:
                        # For existing entries, process all lines
                        lines_to_add = entry_lines.copy()
                        
                        # Handle comma on the last line of the entry
                        last_line = lines_to_add[-1]
                        has_comma = last_line.rstrip().endswith(',')
                        
                        if i < len(all_keys) - 1 and not has_comma:
                            # Needs comma but doesn't have one
                            lines_to_add[-1] = last_line.rstrip() + ','
                        elif i == len(all_keys) - 1 and has_comma:
                            # Last entry shouldn't have comma
                            lines_to_add[-1] = last_line.rstrip().rstrip(',')
                            
                        new_lines.extend(lines_to_add)
                        break
            else:
                # Add new key
                entry = f"{indentation}{key}: '',"
                if i == len(all_keys) - 1:  # Remove comma if it's the last entry
                    entry = entry.rstrip(",")
                new_lines.append(entry)

        new_lines.extend(
            content_lines[end_line:]
        )  # Add closing brace and anything after

        # Write the updated content back to the file
        updated_content = "\n".join(new_lines)
        with open(target_file_path, "w", encoding="utf-8") as f:
            f.write(updated_content)

        print(
            f"{YELLOW}Added {len(missing_keys)} missing keys to {target_file_path.name} in alphabetical order:{RESET}"
        )
        for key in sorted(missing_keys):
            print(f"- {key}")

        return len(missing_keys)

    print(
        f"{RED}Could not find where to insert missing keys in {target_file_path.name}{RESET}"
    )
    return 0


def main():
    """Add missing translation keys to non-default locale files."""
    default_file_path = Path(f"{LOCALES_PATH}/{DEFAULT_LOCALE}")
    if not default_file_path.exists():
        print(f"{RED}Error: Default locale file {DEFAULT_LOCALE} not found!{RESET}")
        sys.exit(1)

    print(f"Using {DEFAULT_LOCALE} as the default locale...")
    default_keys = extract_translation_keys(default_file_path)
    print(f"Found {len(default_keys)} translation keys in {DEFAULT_LOCALE}")

    total_added = 0

    for locale in NON_DEFAULT_LOCALES:
        target_file_path = Path(f"{LOCALES_PATH}/{locale}")
        if not target_file_path.exists():
            print(f"{RED}Error: Target locale file {locale} not found!{RESET}")
            continue

        print(f"\nChecking {locale} for missing keys...")
        total_added += add_missing_keys(default_keys, target_file_path)

    if total_added > 0:
        print(
            f"\n{GREEN}Added a total of {total_added} missing keys across all locale files.{RESET}"
        )
        print(
            f"{YELLOW}NOTE: All added keys have empty string values. Please translate them!{RESET}"
        )
    else:
        print(
            f"\n{GREEN}All locale files already have all keys from {DEFAULT_LOCALE}.{RESET}"
        )


if __name__ == "__main__":
    main()

