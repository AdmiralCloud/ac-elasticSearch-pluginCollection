# Cities database
Create a Elasticsearch database/index based on cities 1000.

# Usage
* Use **yarn install* to install all packages
* create a file named *config.js* on root level of this package
```
module.exports = {
  aws: {
    accessKeys: [{
      accessKeyId: 'ACCESSKEY', 
      secretAccessKey: 'SECRET', 
      region: 'eu-central-1',
    }]
  },
  elasticSearch: {
    servers: [
      { 
        server: 'mcCluster', 
        host: 'AWS ES DOMAIN', 
        port: 443, 
        apiVersion: '7.7', 
        protocol: 'https' 
      }
    ]
  }
}
```

Then run *node index.js*