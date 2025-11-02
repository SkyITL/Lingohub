#!/bin/bash
# Organize UKLO PDFs by year

cd /Users/skyliu/Lingohub/olympiad-problems/UKLO

for file in uklo-*.pdf uklo-*.doc uklo-*.docx; do
  if [ -f "$file" ]; then
    year=$(echo "$file" | grep -oE '20[0-9]{2}')
    if [ ! -z "$year" ]; then
      mv "$file" "by-year/$year/"
      echo "Moved $file -> by-year/$year/"
    fi
  fi
done

echo "Done organizing by year"
