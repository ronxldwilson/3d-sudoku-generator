#!/bin/bash

# Define folders
SRC1="100 3D Sudoku Puzzle Archive"
SRC2="100 3D Sudoku Puzzle Archive 2"
DEST="Combined 3D Sudoku Puzzles"

# Create destination directory
mkdir -p "$DEST"

# Loop from 1 to 100
for i in $(seq -w 1 100); do
    n=$(( (10#$i - 1) * 2 + 1 ))  # e.g., 1 → 1, 2 → 3, 3 → 5...
    next=$((n + 1))

    # Format filenames
    padded_n=$(printf "puzzle-%03d.json" $n)
    padded_next=$(printf "puzzle-%03d.json" $next)

    # Copy from main folder
    cp "$SRC1/puzzle-$i.json" "$DEST/$padded_n"

    # Copy from archive folder
    cp "$SRC2/puzzle-$i.json" "$DEST/$padded_next"
done

echo "✅ Alternating merge complete: '$DEST' now has 200 puzzles."
