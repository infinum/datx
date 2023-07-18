---
id: version-3.0.0-persisting-data-locally
title: Persisting data locally
original_id: persisting-data-locally
---

Sometimes, you'll need to persist some data locally.
Bellow is a basic example using `localStorage`, but the same concept can be applied to any type of persistence:

```javascript
import { Collection } from '@datx/core';

class AppStore extends Collection {
  constructor(data = []) {
    super(data);

    this.loadData(); // Load before init persist to avoid an unnecessary persisting cycle
    this.initPersistData();
  }

  loadData() {
    const data = localStorage.getItem('data'); // Load data from somewhere
    if (data) {
      this.insert(JSON.parse(data).models); // Use insert to add it to the store
    }
  }

  // Call this to save the data
  persistData() {
    const data = JSON.stringify(this.snapshot); // Use any logic you want (e.g. filter by type)
    localStorage.setItem('data', data);
  }
}
```
