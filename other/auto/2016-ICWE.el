(TeX-add-style-hook
 "2016-ICWE"
 (lambda ()
   (add-to-list 'LaTeX-verbatim-macros-with-braces-local "url")
   (add-to-list 'LaTeX-verbatim-macros-with-braces-local "path")
   (add-to-list 'LaTeX-verbatim-macros-with-delims-local "url")
   (add-to-list 'LaTeX-verbatim-macros-with-delims-local "path")
   (TeX-run-style-hooks
    "latex2e"
    "Sections/Introduction"
    "Sections/RationaleBackground"
    "Sections/Platform"
    "Sections/Conclusions"
    "llncs"
    "llncs10"
    "url"
    "graphicx"
    "trackchanges")
   (LaTeX-add-bibitems
    "DBLP:journals/vlc/ArditoCDLMPP14"
    "DBLP:journals/tlsdkcs/BianchiniCAFQT14"
    "DBLP:journals/cacm/BolchiniCOQRST09"
    "DBLP:journals/debu/BolchiniOQST11"
    "journals/TWEB2015/CappielloMP15"
    "DBLP:books/sp/DanielM14")))

