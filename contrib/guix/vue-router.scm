(define-module (vue-router)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix build-system node)
  #:use-module (vue))

(define-public node-vue-router-4.1.6
  (package
    (name "node-vue-router")
    (version "4.1.6")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/vue-router/-/vue-router-4.1.6.tgz")
        (sha256
          (base32
            "13wvrd5h92l0m2byd1k778fnmachdb0px2fl8fbxil4r9fl5hxa3"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (inputs
      `(("node-vue-devtools-api"
         ,node-vue-devtools-api-6.5.0)))
    (home-page
      "https://github.com/vuejs/router#readme")
    (synopsis "")
    (description "")
    (license license:expat)))
