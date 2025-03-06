#!/usr/bin/env python3

import re
import subprocess
import json
import sys
from pathlib import Path

# Configuration
LOCALES_PATH = "src/locales"
UI_SRC_PATH = "src"
LOCALE_TO_CHECK = "en.ts"

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


def is_key_used(key, src_path):
    """Check if a translation key is used in the codebase."""
    # Different patterns to search for
    patterns = [
        f"t\\('{key}'\\)",
        f't\\("{key}"\\)',
        f"t\\(`{key}`\\)",
        f"'{key}'",
        f'"{key}"',
        f"`{key}`",
    ]

    for pattern in patterns:
        try:
            cmd = [
                "grep",
                "-r",
                pattern,
                str(src_path),
                "--include=*.tsx",
                "--include=*.ts",
            ]

            # Run grep command and filter out matches in locales directory
            result = subprocess.run(cmd, capture_output=True, text=True, check=False)

            if result.returncode == 0:
                # Filter out matches in locale files
                filtered_lines = [
                    line
                    for line in result.stdout.splitlines()
                    if "locales/" not in line
                ]

                if filtered_lines:
                    return True
        except subprocess.SubprocessError:
            print(f"Error running grep for key '{key}'")

    return False


def main():
    """Find unused translation keys in the locale file."""
    print(f"Checking for unused translation keys in {LOCALE_TO_CHECK}...")

    locale_file_path = Path(f"{LOCALES_PATH}/{LOCALE_TO_CHECK}")
    if not locale_file_path.exists():
        print(f"Error: Locale file {LOCALE_TO_CHECK} not found!")
        sys.exit(1)

    keys = extract_translation_keys(locale_file_path)
    print(f"Found {len(keys)} translation keys in {LOCALE_TO_CHECK}")

    unused_keys = []
    used_keys = []

    # Process each key
    for key in keys:
        print(f"Checking key: {key}... ", end="")

        if not is_key_used(key, UI_SRC_PATH):
            print(f"{RED}UNUSED{RESET}")
            unused_keys.append(key)
        else:
            print(f"{GREEN}USED{RESET}")
            used_keys.append(key)

    # Print summary
    print("\n--- SUMMARY ---")
    if not unused_keys:
        print(f"{GREEN}No unused translation keys found!{RESET}")
    else:
        print(f"{YELLOW}Found {len(unused_keys)} unused translation keys:{RESET}")
        for key in unused_keys:
            print(f"- {key}")

    print(f"\nTotal keys: {len(keys)}")
    print(f"Used keys: {len(used_keys)}")
    print(f"Unused keys: {len(unused_keys)}")

    # Optionally export the results to a JSON file
    results = {
        "total_keys": len(keys),
        "used_keys": used_keys,
        "unused_keys": unused_keys,
    }

    with open("unused_translations.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\nResults exported to ./unused_translations.json")


if __name__ == "__main__":
    main()
