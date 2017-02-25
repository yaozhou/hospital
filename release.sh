#!/bin/sh

MAJOR_VER="$1"
MINOR_VER="$2"


echo "{\"staging_key\" : \"$STAGING_KEY\", \"min_ver\" : \"$MINOR_VER\"}" > config.json

if [ ! -n "$MAJOR_VER" -o  ! -n "$MINOR_VER"  ] ;  then
    echo "usage : $0 major_ver min_version" ; 
    exit 1 ;
fi



ROOT="$(cd $(dirname $0) && pwd)"

cd $ROOT/android
./gradlew  assembleRelease
cd ..

target="yuyue_$MAJOR_VER.$MINOR_VER.apk"
cp $ROOT/android/app/build/outputs/apk/app-release.apk  "$ROOT/build/$target"
scp "$ROOT/build/$target" yao@115.29.164.142:/home/yao/web/

echo "download url is http://115.29.164.142:8000/$target"
