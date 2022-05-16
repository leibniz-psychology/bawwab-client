(define-module (bawwab)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (gnu packages)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix gexp)
  #:use-module (guix build-system gnu)
  #:use-module (gnu packages web)
  #:use-module (gnu packages node)
  #:use-module (commonmark)
  #:use-module (vue)
  #:use-module (vue-i18n)
  #:use-module (vue-router)
  #:use-module (purecss)
  #:use-module (srfi srfi-1)
  #:use-module (srfi srfi-26))

(define %source-dir (dirname (dirname (dirname (current-filename)))))

(define-public bawwab-client
  (package
    (name "bawwab-client")
    (version "0.1")
    (source (local-file %source-dir #:recursive? #t))
    (build-system gnu-build-system)
    (arguments
      (list
       #:tests? #f ; No tests.
       #:make-flags #~(list (string-append "PREFIX=" #$output))
       #:phases
       #~(modify-phases %standard-phases
         (delete 'configure))))
    (inputs
      `(("node-vue" ,node-vue-3.2.22)
        ("node-vue-router" ,node-vue-router-4.0.12)
        ("node-purecss" ,node-purecss-2.0.6)
        ("node-commonmark" ,node-commonmark-0.30.0)
        ("node-vue-i18n" ,node-vue-i18n-9.1.9)))
    (native-inputs
     `(("esbuild" ,esbuild)
       ;; Propagate NODE_PATH to build environment, so esbuild can find external
       ;; modules.
       ("node" ,node)))
    (home-page "https://github.com/leibniz-psychology/bawwab-client")
    (synopsis #f)
    (description #f)
    (license #f)))

