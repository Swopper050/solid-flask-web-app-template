#!/usr/bin/env python3

import re
import subprocess
import sys
import argparse
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
    parser = argparse.ArgumentParser(
        description="Find unused translation keys in locale files"
    )
    parser.add_argument(
        "--ci",
        action="store_true",
        help="Run in CI mode (fails on unused translations)",
    )
    parser.add_argument("--quiet", action="store_true", help="Reduce output verbosity")
    args = parser.parse_args()

    ci_mode = args.ci
    quiet_mode = args.quiet

    if not quiet_mode:
        print(f"Checking for unused translation keys in {LOCALE_TO_CHECK}...")

    locale_file_path = Path(f"{LOCALES_PATH}/{LOCALE_TO_CHECK}")
    if not locale_file_path.exists():
        print(f"Error: Locale file {LOCALE_TO_CHECK} not found!")
        sys.exit(1)

    keys = extract_translation_keys(locale_file_path)
    if not quiet_mode:
        print(f"Found {len(keys)} translation keys in {LOCALE_TO_CHECK}")

    unused_keys = []
    used_keys = []

    # Process each key
    for key in keys:
        if not quiet_mode:
            print(f"Checking key: {key}... ", end="")

        if not is_key_used(key, UI_SRC_PATH):
            if not quiet_mode:
                print(f"{RED}UNUSED{RESET}")
            unused_keys.append(key)
        else:
            if not quiet_mode:
                print(f"{GREEN}USED{RESET}")
            used_keys.append(key)

    # Print summary
    print("\n--- SUMMARY ---")
    if not unused_keys:
        print(f"{GREEN}No unused translation keys found!{RESET}")
    else:
        print(
            f"{RED if ci_mode else YELLOW}Found {len(unused_keys)} unused translation keys:{RESET}"
        )
        for key in unused_keys:
            print(f"- {key}")

    print(f"\nTotal keys: {len(keys)}")
    print(f"Used keys: {len(used_keys)}")
    print(f"Unused keys: {len(unused_keys)}")

    # In CI mode, exit with error if unused keys are found
    if ci_mode and unused_keys:
        print(
            f"{RED}Error: Found {len(unused_keys)} unused translation keys in CI mode!{RESET}"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
