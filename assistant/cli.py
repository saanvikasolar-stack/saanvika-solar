"""CLI for the personal assistant agent."""

from __future__ import annotations

import argparse
import sys

from dotenv import load_dotenv

from assistant.agent import handle_message


def main(argv: list[str] | None = None) -> int:
    load_dotenv()
    parser = argparse.ArgumentParser(description="Personal assistant agent")
    parser.add_argument(
        "message",
        nargs="?",
        help="One-shot message (omit for interactive chat)",
    )
    parser.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Interactive chat mode",
    )
    args = parser.parse_args(argv)

    if args.interactive or not args.message:
        print("Personal Assistant (type 'help' or 'quit')")
        while True:
            try:
                line = input("you> ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if not line:
                continue
            if line.lower() in {"quit", "exit", "q"}:
                break
            response = handle_message(line)
            print(response["reply"])
            print()
        return 0

    response = handle_message(args.message)
    print(response["reply"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
