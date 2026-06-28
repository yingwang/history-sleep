import argparse
import asyncio
from pathlib import Path

import edge_tts


async def main() -> None:
    parser = argparse.ArgumentParser(description="Generate one narration mp3 with edge-tts.")
    parser.add_argument("--text-file", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--voice", required=True)
    parser.add_argument("--rate", default="-25%")
    parser.add_argument("--volume", default="-8%")
    parser.add_argument("--pitch", default="-2Hz")
    args = parser.parse_args()

    text = Path(args.text_file).read_text(encoding="utf-8").strip()
    if not text:
        raise SystemExit("Text file is empty.")

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(
        text,
        args.voice,
        rate=args.rate,
        volume=args.volume,
        pitch=args.pitch,
    )
    await communicate.save(str(output))


if __name__ == "__main__":
    asyncio.run(main())
