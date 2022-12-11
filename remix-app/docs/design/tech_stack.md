## Tech Stack

Here I list a few reason why I choose thses tech stack

1. There are 2 reasons, I choose **Remix.run** as the fullstack development framework
   - Due to limited contributors, choosing a framework that develops fullstack by one programming language is essential
   - To make this app a long lasting app, we would like to choose state-of-the-art technology, so that we will not have to upgrade the techonology in a short time
2. Will use AWS **Dyanmodb** as our persistence store (I don't have solid reason for this, just a few thoughts)
   - Since Dynamodb is NoSQL database, we will have less burden on updating schema
   - Dynamodb has good support on stream, this makes us easier to wire Dynamodb with Elasticsearch
   - Since Dynamodb is a serverless service, we get data redundancy, non-administration by free
   - We don't have strong ACID requirements
3. All our infrastructure relies on **AWS**
   - It Has the most market share among other cloud computing service (Google Cloud, MS Azure, etc)
   - I have more aws experience than other platform, and personally I more prefer the DX on AWS platform
4. Using **Elasticsearch** as our search engine
   - Widely used in industry
   - Support multi-lingual search
   - Personally, I don't have any search engine experience other than Elasticsearch
5. Using **DeepL** as our AI tranlation assistant
   - We have tested a few translation apps in the market, this one is probably the most advanced or accurate app

### Frontend lib

- reactjs: widely used frontend library
- charkra-ui: instead of using pure css, it's better to choose a UI component lib, so that we can save more time
- CASL: choose casl as the authorization lib, because it supports both reactjs and nodejs, and it has good semantic meaning when composing rules
- remix-auth: this is our authentication lib, another copy of `passport` lib. remix-auth is a strategy based lib.

### Backend lib

- serverless-stack: this is our infrastracture framework, only works for aws (cause only aws provides cdk)
- aws-lambda: will be used as our task runner (parse documents)
- CASL: choose casl as the authorization lib, because it supports both reactjs and nodejs, and it has good semantic meaning when composing rules
