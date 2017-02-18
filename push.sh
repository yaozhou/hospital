#!/bin/sh


MAJOR_VER="$1"
MINOR_VER="$2"

APP_NAME="yuyue"
if [ ! -n "$MAJOR_VER" -o  ! -n "$MINOR_VER"  ] ;  then
    echo "usage : $0 major_ver min_version" ; 
    exit 1 ;
fi

ROOT="$(cd $(dirname $0) && pwd)"

OUTPUT_PATH="$ROOT/build/$MAJOR_VER/$MINOR_VER" 
code-push release "$APP_NAME" "$OUTPUT_PATH" "$MAJOR_VER"

