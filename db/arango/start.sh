docker run -e ARANGO_ROOT_PASSWORD=htl -p 8529:8529 -d \
          -v $HOME/arangodb:/var/lib/arangodb3 \
          arangodb