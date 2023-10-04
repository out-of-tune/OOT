#!/bin/bash
FILE=./success

for i in `seq 10`;
do
    if [ -f "$FILE" ]; then
        echo "Found file $FILE"
        exit 0
    fi
    sleep 5
done

echo "File $FILE not found"
exit 1