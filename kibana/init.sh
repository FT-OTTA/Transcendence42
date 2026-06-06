# kibana/init.sh
#!/bin/sh

echo "Waiting for Kibana..."
until curl -s "http://kibana:5601/kibana/api/status" | grep -q '"level":"available"'; do
  sleep 5
done

echo "Importing saved objects..."
curl -X POST "http://kibana:5601/kibana/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form "file=@/kibana-init/saved_objects.ndjson;type=application/ndjson" \
  
echo "Done!"