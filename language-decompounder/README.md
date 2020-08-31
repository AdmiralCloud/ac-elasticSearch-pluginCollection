# Analysis/Langauge decompounder

## Ingest new data
We have created an ingestion tool, that takes a list of compound words, separates them into parts (hypenation) orders those parts alphabetically and writes them into a file. Voilà, there is your ElasticSearch dictionary for compound words.
```
node index.js --in wordlist.txt --out dictionary-lang.txt --language en-us
```

Put the dictionary and the hyphenation_pattern file into your elasticsearch analysis folder (e.g. Mac homebrew: /usr/local/etc/elasticsearch/analysis)

## Example
Now, let's assume you want to use an English word list, you should have two files in your analysis folder:
+ en.xml (hypenation)
+ dictionary-lang.txt (file created with this app)

Let's assume the dictionary-lang.txt file has only this entry:
```
box
sand
```

Please remember, do not put compound words into these dictionary but just the parts (NOT *sandbox*, just *sand* and *box*).

```
http://localhost:9200/_analyze

{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "hyphenation_decompounder",
      "word_list_path": "analysis/dictionary-lang.txt",
      "hyphenation_patterns_path": "analysis/en.xml"
    }
  ],
  "text": "sandbox"
}

---> Result:
{
    "tokens": [
        {
            "token": "sandbox",
            "start_offset": 0,
            "end_offset": 7,
            "type": "<ALPHANUM>",
            "position": 0
        },
        {
            "token": "sand",
            "start_offset": 0,
            "end_offset": 7,
            "type": "<ALPHANUM>",
            "position": 0
        },
        {
            "token": "box",
            "start_offset": 0,
            "end_offset": 7,
            "type": "<ALPHANUM>",
            "position": 0
        }
    ]
}

```


# Thanks
Inspiration, read-on and thanks to:
+ https://www.tug.org/tex-hyphen/

+ https://github.com/mnater/Hyphenopoly
+ https://github.com/uschindler/german-decompounder

# Contributors
## Links
- [Website](https://www.admiralcloud.com/)
- [Twitter (@admiralcloud)](https://twitter.com/admiralcloud)

## License
[MIT License](https://opensource.org/licenses/MIT) Copyright © 2009-present, AdmiralCloud, Mark Poepping