#!/bin/bash
# Check which IOL problems have supplements

echo "Checking for IOL problem supplements..."
echo ""

for year in {2003..2024}; do
  for type in indiv team; do
    url="https://ioling.org/booklets/iol-${year}-${type}-supp.zip"

    if curl -I -s "$url" 2>/dev/null | grep -q "HTTP/2 200"; then
      echo "✓ IOL $year $type has supplements"
    fi
  done
done

echo ""
echo "Done checking supplements"
