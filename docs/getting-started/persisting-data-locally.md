---
id: persisting-data-locally
title: Persisting data locally
---

Sometimes, you'll need to persist some data locally.
Bellow is a basic example using `localStorage`, but the same concept can be applied to any type of persistence:

```javascript
import { autorun } from 'mobx';
import { Collection } from 'datx';

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

  initPersistData() {
    autorun(() => {
      const data = JSON.stringify(this.snapshot); // Use any logic you want (e.g. filter by type)
      localStorage.setItem('data', data);
    });
  }
}
```

The code will use MobX `autorun` to monitor the collection and persist the data only when something relevant changes (e.g. it will ignore changes to models you're not persisting).
