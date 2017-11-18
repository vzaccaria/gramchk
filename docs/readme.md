# gramchk

> Checks either latex or markdown files with external grammar check
> tools. Strips latex and markdown markup (somewhat). Output is
> compatible with Emacs flycheck.

## Supported grammar check tools

-   [LanguageTool](https://languagetool.org/) (external http request)
-   After the deadline (external HTTP request)
-   Alex (built-in)
-   Writegood (built-in)
-   Proselint (local installation)

## Install

    npm install gramchk

## Usage

In Emacs, define a new flycheck checker:

``` elisp
(flycheck-define-checker grammar-gramcheck
           "A general purpose grammar checker. "
           :command ("gramchk" "check" source-original "--auto")
           :error-parser flycheck-parse-checkstyle
           :standard-input nil 
           :modes (markdown-mode)
           )
```

## Configuration

You can configure individual tools through a rule file. To generate an
example configuration file: 

``` sh
> gramchk dumpconfig
languagetool:
  url: 'http://localhost:8081/v2/check'
  disabledRules:
    - WHITESPACE_RULE
    - COMMA_PARENTHESIS_WHITESPACE
  ignoredSuggestions: []
  language: en-us
atd:
  url: 'http://127.0.0.1:1049'
```


## Author

-   Vittorio Zaccaria

## License

Released under the BSD License.

------------------------------------------------------------------------
