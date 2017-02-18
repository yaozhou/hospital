#!/bin/sh



MAJOR_VER="$1"
MINOR_VER="$2"


STAGING_KEY="230G9uhiOfYF03Ri7PvjX4fNq8PqVJxFz3ktG";

echo "{\"staging_key\" : \"$STAGING_KEY\", \"min_ver\" : \"$MINOR_VER\"}" > config.json

if [ ! -n "$MAJOR_VER" -o  ! -n "$MINOR_VER"  ] ;  then
    echo "usage : $0 major_ver min_version" ; 
    exit 1 ;
fi



ROOT="$(cd $(dirname $0) && pwd)"

OUTPUT_PATH="$ROOT/build/$MAJOR_VER/$MINOR_VER"

[ ! -d "$OUTPUT_PATH" ] && mkdir -p "$OUTPUT_PATH"
react-native bundle --platform android --entry-file index.android.js --bundle-output  "$OUTPUT_PATH/index.android.bundle" --assets-dest "$OUTPUT_PATH" --dev false
