Here, we thoroughly test JSON5's parsing. These are mostly unit tests of each
individual type, but there can (and should) be aggregate test cases, too.

JSON5 should be fully backwards-compatible with existing JSON. Valid JSON test
cases are under `/cases-json`. These cases are tested against the native
`JSON.parse()`.

JSON5's new features that aren't valid JSON should still be fully valid ES5.
These test cases are under `/cases-es5`. These cases are tested against strict
mode `eval()`.

Both cases support both positive and negative test cases. E.g. Invalid JSON
should also be invalid JSON5; if `JSON.parse()` throws an error, it will be
tested that `JSON5.parse()` does, too.

This should cover all bases, including syntax that's valid ES5 but invalid
JSON5 — since JSON5 is a strict superset of JSON, that syntax should also be
invalid JSON.

Test cases that are expected to fail right now due to known issues are under
`/cases-todo`. We should aim to keep this empty, of course. =)

Here's a textual flowchart to help you figure out where to put a test case:

    - Is it valid JSON?
      => /cases-json

    - Is it invalid ES5?
      => /cases-es5

    - Is it invalid JSON, but valid JSON5?
      => /cases-es5

    - Is it valid ES5, but invalid JSON5?
      => /cases-json

    - Is it not working yet, and fixing it won't be trivial?
      => /cases-todo
