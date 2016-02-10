#!/usr/bin/env sh
set -e

# Source directory
#
srcdir=$(dirname "$0")
srcdir=$(cd "$srcdir"; pwd)

bindir=$srcdir/../../..
npm=$bindir/node_modules/.bin

rm -f $srcdir/output

$bindir/index.js -a -x $srcdir/Conclusions.tex > "$srcdir/output"
"$npm/diff-files" -m "Test local ATD and LT connection:" "$srcdir/output" "$srcdir/reference"
