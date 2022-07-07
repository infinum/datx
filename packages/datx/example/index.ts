import { IResource } from '../src';
import { User, Comment, CustomType } from './schemas';

const user: IResource<typeof User> = {
  username: 'Foo',
};

const data: IResource<typeof Comment> = {
  date: new Date(),
  upvotes: [
    {
      username: 'Darko',
    },
    user,
    {
      username: 'Zero cool',
      age: 1337,
    },
  ],
  author: {
    username: 'Darko',
  },
  post: {
    title: 'foobar',
    date: new Date(),
    text: 'Lorem ipsum',
  },
  text: 'This is a test',
  test: new CustomType(),
};

const comment = Comment.parse({
  date: '2022-07-01T00:00:00.000Z',
  upvotes: [
    {
      username: 'Darko',
    },
  ],
  author: {
    username: 'Darko',
  },
  post: {
    title: 'foobar',
    date: '2022-07-01T00:00:00.000Z',
    text: 'Lorem ipsum',
  },
  text: 'This is a test',
  // test: 2,
});

console.log(data.date.toISOString(), 'This is a date');
console.log(data.text, 'This is a string');
console.log(data.author.username, 'This is a string (with an optional author)');
console.log(data.author.age, 'This is an optional number');
console.log(data.upvotes.map((u) => u.username));
console.log(data.test?.foo, 'custom type props');
console.log(Comment.serialize(data).test, 'should be a number');
console.log(comment.test?.foo, 'should be a custom type');

Comment.validate(
  {
    // @ts-expect-error Check if the type validation works
    date: true,
    upvotes: [
      {
        username: 'Darko',
      },
      user,
      {
        username: 'Zero cool',
        age: 1337,
        // @ts-expect-error Check if the extra param is detected
        foobar: true,
      },
    ],
    // Check if the missing author prop is detected
    // Check if the extra param is detected
    foo: 1,
    post: {
      title: 'foobar',
      date: new Date(),
      text: 'Lorem ipsum',
    },
    // @ts-expect-error Check if the type validation works for custom types
    test: 'bar',
  },
  { strict: true, throw: true },
);

// ---------------

// const client = new Client();

// const data1 = client.for(Comment).getWhere({ post: 123 });
// const data2 = client.for(Post).get(123);

// if (data1.length) {
//   console.log(data1[0].date.toISOString()); // This is a date
//   console.log(data1[0].text); // This is a string
//   console.log(data1[0].author?.username); // This is a string (with an optional author)
//   console.log(data1[0].author?.age); // This is an optional number
//   console.log(data1[0].upvotes.map((u) => u.username));
//   console.log(data1[0].test.foo); // custom type props
// }

// console.log('data2', data2?.date.toDateString());
