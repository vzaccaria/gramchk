var {
  generateProject
} = require("diy-build");

var path = require("path");

generateProject(_ => {
  _.collect("docs", _ => {
    _.cmd("./node_modules/.bin/git-hist history.md");
    _.cmd(
      "./node_modules/.bin/mustache package.json docs/readme.md | ./node_modules/.bin/stupid-replace '~USAGE~' -f docs/usage.md > readme.md"
    );
    _.cmd("cat history.md >> readme.md");
    _.cmd("mkdir -p ./man/man1");
    _.cmd("pandoc -s -f markdown -t man readme.md > ./man/man1/gramchk.1");
    _.cmd("hub cm 'update docs and history.md'");
  });

  _.collectSeq("all", _ => {
    _.cmd("make docs");
  });

  _.collect("test", _ => {
    _.cmd("make all");
    _.cmd("./tests/test.sh");
  });

  _.collect("update", _ => {
    _.cmd("make clean && node configure.js");
  });

  ["major", "minor", "patch"].map(it => {
    _.collect(it, _ => {
      _.cmd(`make all`);
      _.cmd("make docs");
      _.cmd(`./node_modules/.bin/xyz -i ${it}`);
    });
  });
});
