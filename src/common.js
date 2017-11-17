const tmp = require("tmp-promise");
const $fs = require("mz/fs");
const { exec } = require("child_process");
const _ = require("lodash");
const $b = require("bluebird");
let debug = require("debug")(__filename);

let exec_db = (options, cmd) => {
  return new $b(resolve => {
    exec(cmd, (error, out, err) => {
      resolve([out, err, error]);
    });
  });
};

const execWithString = (cmd, string, options) => {
  const global = !_.get(options, "locally", false);
  const keep = !_.get(options, "cleanup", true);
  const postfix = _.get(options, "postfix", ".tmp");
  let file_p;
  if (global) {
    file_p = tmp.file({ postfix, keep: false });
  } else {
    file_p = tmp
      .tmpName({ template: `./tmp-XXXXXXX${postfix}`, postfix, keep })
      .then(o => {
        return {
          path: o
        };
      });
  }
  return file_p.then(o => {
    return $fs
      .writeFile(o.path, string, "utf8")
      .then(() => {
        const cc = cmd(o.path);
        return exec_db(options, cc);
      })
      .then(
        a => {
          if (!keep) {
            if (global) {
              o.cleanup();
            } else {
              return exec_db(options, `rm -f ${o.path}`);
            }
          }
          return a[0];
        },
        e => {
          throw e;
        }
      );
  });
};

module.exports = { execWithString };
