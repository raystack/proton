#!/usr/bin/env python3
"""Build script for generating Python protobuf code."""

import subprocess
import shutil
import sys
from pathlib import Path


# Get the proton root directory
ROOT_DIR = Path(__file__).parent.parent.parent
PYTHON_DIR = Path(__file__).parent.parent
DIST_DIR = PYTHON_DIR / "dist"


def clean():
    """Remove the dist directory."""
    if DIST_DIR.exists():
        print(f"Cleaning {DIST_DIR}")
        shutil.rmtree(DIST_DIR)


def publish():
    """Build wheel for publishing."""
    if not DIST_DIR.exists():
        print("Error: dist directory not found. Run 'build' first.", file=sys.stderr)
        sys.exit(1)

    # Check if build package is installed
    check_build = subprocess.run(
        [sys.executable, "-m", "build", "--version"],
        capture_output=True
    )
    if check_build.returncode != 0:
        print("Error: 'build' package not installed. Install it with:")
        print("  pip install build")
        sys.exit(1)

    print("Building wheel...")
    result = subprocess.run(
        [sys.executable, "-m", "build", "--wheel"],
        cwd=DIST_DIR
    )

    if result.returncode != 0:
        print("Wheel build failed!", file=sys.stderr)
        sys.exit(1)

    print("Wheel built successfully!")
    print(f"Output: {DIST_DIR}/dist/")


def build(version_hash=None):
    """Generate Python code from proto files."""
    clean()

    cmd = [
        "buf",
        "generate",
        "--template",
        "python/scripts/buf.gen.yaml",
        "--include-imports",
        "--path",
        "raystack",
        ".",
    ]

    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=ROOT_DIR)

    if result.returncode != 0:
        print("Build failed!", file=sys.stderr)
        sys.exit(1)

    # Create __init__.py files in all directories
    if DIST_DIR.exists():
        print("Creating __init__.py files...")
        for dir_path in DIST_DIR.rglob("*"):
            if dir_path.is_dir():
                init_file = dir_path / "__init__.py"
                if not init_file.exists():
                    init_file.touch()

    # Copy pyproject.toml template to dist
    template_file = Path(__file__).parent / "pyproject.template.toml"
    if template_file.exists():
        print("Copying pyproject.toml to dist...")
        content = template_file.read_text()

        # Update version if hash is provided
        if version_hash:
            version_str = f"0.1.0+{version_hash}"
            content = content.replace('version = "0.1.0"', f'version = "{version_str}"')
            print(f"Set version to: {version_str}")

        (DIST_DIR / "pyproject.toml").write_text(content)

    # Copy README to dist
    readme_file = PYTHON_DIR / "README.md"
    if readme_file.exists():
        print("Copying README.md to dist...")
        shutil.copy(readme_file, DIST_DIR / "README.md")

    # Copy LICENSE to dist
    license_file = ROOT_DIR / "LICENSE"
    if license_file.exists():
        print("Copying LICENSE to dist...")
        shutil.copy(license_file, DIST_DIR / "LICENSE")

    print("Build successful!")


def build_cli():
    """CLI entry point for build command."""
    import argparse

    parser = argparse.ArgumentParser(description="Build Python protobuf package")
    parser.add_argument("--hash", help="Version hash to append (e.g., git commit hash)")

    args = parser.parse_args()
    build(version_hash=args.hash)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Build Python protobuf package")
    parser.add_argument("command", choices=["clean", "build", "publish"], help="Command to run")
    parser.add_argument("--hash", help="Version hash to append (e.g., git commit hash)")

    args = parser.parse_args()

    if args.command == "clean":
        clean()
    elif args.command == "build":
        build(version_hash=args.hash)
    elif args.command == "publish":
        publish()


if __name__ == "__main__":
    main()
