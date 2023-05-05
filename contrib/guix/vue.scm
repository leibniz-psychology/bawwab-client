(define-module (vue)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix build-system node))

(define-public node-vue-reactivity-3.2.47
  (package
    (name "node-vue-reactivity")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/reactivity/-/reactivity-3.2.47.tgz")
        (sha256
          (base32
            "0bmy30qjjgpccgb34z5h595pfhlaxgninngwsd4cl7vwgw5qi02j"))))
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
      `(("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/reactivity#readme")
    (synopsis "vue/reactivity")
    (description "vue/reactivity")
    (license license:expat)))

(define-public node-vue-runtime-core-3.2.47
  (package
    (name "node-vue-runtime-core")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/runtime-core/-/runtime-core-3.2.47.tgz")
        (sha256
          (base32
            "181b4wzrmqp0by8n732y9lnsawwvjdhfl8mbxw00d7j0jmplgdh3"))))
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
      `(("node-vue-reactivity"
         ,node-vue-reactivity-3.2.47)
        ("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/runtime-core#readme")
    (synopsis "vue/runtime-core")
    (description "vue/runtime-core")
    (license license:expat)))

(define-public node-csstype-2.6.21
  (package
    (name "node-csstype")
    (version "2.6.21")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/csstype/-/csstype-2.6.21.tgz")
        (sha256
          (base32
            "1g5mlmsymw369yp44aidkczzljlsky3k6vl2j0c81zvyyyqbfgdg"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/frenic/csstype#readme")
    (synopsis
      "Strict TypeScript and Flow types for style based on MDN data")
    (description
      "Strict TypeScript and Flow types for style based on MDN data")
    (license license:expat)))

(define-public node-vue-runtime-dom-3.2.47
  (package
    (name "node-vue-runtime-dom")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/runtime-dom/-/runtime-dom-3.2.47.tgz")
        (sha256
          (base32
            "03vidfq5j54v9w88qpdi0xiid2jmwavmv54c3rigcj6nfzz33aqg"))))
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
      `(("node-csstype" ,node-csstype-2.6.21)
        ("node-vue-runtime-core"
         ,node-vue-runtime-core-3.2.47)
        ("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/runtime-dom#readme")
    (synopsis "vue/runtime-dom")
    (description "vue/runtime-dom")
    (license license:expat)))

(define-public node-vue-reactivity-transform-3.2.47
  (package
    (name "node-vue-reactivity-transform")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/reactivity-transform/-/reactivity-transform-3.2.47.tgz")
        (sha256
          (base32
            "0k0lv75n1y179wm6r93a2gv0j4rznlrr3yxvmjhhmqwqxpz4hbsg"))))
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
      `(("node-magic-string" ,node-magic-string-0.25.9)
        ("node-estree-walker" ,node-estree-walker-2.0.2)
        ("node-vue-shared" ,node-vue-shared-3.2.47)
        ("node-vue-compiler-core"
         ,node-vue-compiler-core-3.2.47)
        ("node-babel-parser" ,node-babel-parser-7.20.15)))
    (home-page
      "https://github.com/vuejs/core/tree/dev/packages/reactivity-transform#readme")
    (synopsis "vue/reactivity-transform")
    (description "vue/reactivity-transform")
    (license license:expat)))

(define-public node-sourcemap-codec-1.4.8
  (package
    (name "node-sourcemap-codec")
    (version "1.4.8")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/sourcemap-codec/-/sourcemap-codec-1.4.8.tgz")
        (sha256
          (base32
            "08b6ydyfckjgccn2g3sy028diin7wdzhdjmy7nlbsz0mqf9adxv0"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/Rich-Harris/sourcemap-codec")
    (synopsis "Encode/decode sourcemap mappings")
    (description "Encode/decode sourcemap mappings")
    (license license:expat)))

(define-public node-magic-string-0.25.9
  (package
    (name "node-magic-string")
    (version "0.25.9")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/magic-string/-/magic-string-0.25.9.tgz")
        (sha256
          (base32
            "0ysp5r6013yrradhcdj4avjxalhdni6ylc4by0nsc2pyyb0a7f6k"))))
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
      `(("node-sourcemap-codec"
         ,node-sourcemap-codec-1.4.8)))
    (home-page
      "https://github.com/rich-harris/magic-string#readme")
    (synopsis "Modify strings, generate sourcemaps")
    (description
      "Modify strings, generate sourcemaps")
    (license license:expat)))

(define-public node-nanoid-3.3.4
  (package
    (name "node-nanoid")
    (version "3.3.4")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/nanoid/-/nanoid-3.3.4.tgz")
        (sha256
          (base32
            "122z0pcxwisa1729iyxnjmpqx6bw22v0dprcypycab6farkcv0g8"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page "https://github.com/ai/nanoid#readme")
    (synopsis
      "A tiny (116 bytes), secure URL-friendly unique string ID generator")
    (description
      "A tiny (116 bytes), secure URL-friendly unique string ID generator")
    (license license:expat)))

(define-public node-picocolors-1.0.0
  (package
    (name "node-picocolors")
    (version "1.0.0")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/picocolors/-/picocolors-1.0.0.tgz")
        (sha256
          (base32
            "10zk2pciqiyxjapg6yp7n02nbvvyy00a6k8sz7jibsh6lhmyqqk0"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/alexeyraspopov/picocolors#readme")
    (synopsis
      "The tiniest and the fastest library for terminal output formatting with ANSI colors")
    (description
      "The tiniest and the fastest library for terminal output formatting with ANSI colors")
    (license license:isc)))

(define-public node-source-map-js-1.0.2
  (package
    (name "node-source-map-js")
    (version "1.0.2")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/source-map-js/-/source-map-js-1.0.2.tgz")
        (sha256
          (base32
            "0drlsq75y991qlc9c8hhxklla24g4bsn398kwapcgnvyywi0i35b"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/7rulnik/source-map-js")
    (synopsis "Generates and consumes source maps")
    (description
      "Generates and consumes source maps")
    (license license:bsd-3)))

(define-public node-postcss-8.4.21
  (package
    (name "node-postcss")
    (version "8.4.21")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/postcss/-/postcss-8.4.21.tgz")
        (sha256
          (base32
            "1c3w3lss78pv1c5r3d4kzrjhxrjca9glf4b9vbijzm7hri61nj81"))))
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
      `(("node-source-map-js" ,node-source-map-js-1.0.2)
        ("node-picocolors" ,node-picocolors-1.0.0)
        ("node-nanoid" ,node-nanoid-3.3.4)))
    (home-page "https://postcss.org/")
    (synopsis
      "Tool for transforming styles with JS plugins")
    (description
      "Tool for transforming styles with JS plugins")
    (license license:expat)))

(define-public node-vue-compiler-sfc-3.2.47
  (package
    (name "node-vue-compiler-sfc")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/compiler-sfc/-/compiler-sfc-3.2.47.tgz")
        (sha256
          (base32
            "16xhahi12s3cwp74rjhrwnmhhvrbqbg0bm1c8bv8pm8bbg7abwfb"))))
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
      `(("node-postcss" ,node-postcss-8.4.21)
        ("node-source-map" ,node-source-map-0.6.1)
        ("node-magic-string" ,node-magic-string-0.25.9)
        ("node-estree-walker" ,node-estree-walker-2.0.2)
        ("node-vue-shared" ,node-vue-shared-3.2.47)
        ("node-vue-reactivity-transform"
         ,node-vue-reactivity-transform-3.2.47)
        ("node-vue-compiler-ssr"
         ,node-vue-compiler-ssr-3.2.47)
        ("node-vue-compiler-dom"
         ,node-vue-compiler-dom-3.2.47)
        ("node-vue-compiler-core"
         ,node-vue-compiler-core-3.2.47)
        ("node-babel-parser" ,node-babel-parser-7.20.15)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/compiler-sfc#readme")
    (synopsis "vue/compiler-sfc")
    (description "vue/compiler-sfc")
    (license license:expat)))

(define-public node-vue-shared-3.2.47
  (package
    (name "node-vue-shared")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/shared/-/shared-3.2.47.tgz")
        (sha256
          (base32
            "01nnnl3n7wccvwb2fvjcw6jpkf503159674y8p2lgf7ksm6fk3xs"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/shared#readme")
    (synopsis
      "internal utils shared across vue packages")
    (description
      "internal utils shared across vue packages")
    (license license:expat)))

(define-public node-babel-parser-7.20.15
  (package
    (name "node-babel-parser")
    (version "7.20.15")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@babel/parser/-/parser-7.20.15.tgz")
        (sha256
          (base32
            "0nl954nw9r1w8505hg5w74wnb82pxfrv4xw0zrvzh4nsyp61ylpv"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://babel.dev/docs/en/next/babel-parser")
    (synopsis "A JavaScript parser")
    (description "A JavaScript parser")
    (license license:expat)))

(define-public node-estree-walker-2.0.2
  (package
    (name "node-estree-walker")
    (version "2.0.2")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/estree-walker/-/estree-walker-2.0.2.tgz")
        (sha256
          (base32
            "0n1wn3ii6q3dcjy2sbsawsysgyad1hlijhb3as6mdid977jk2a9h"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/Rich-Harris/estree-walker#readme")
    (synopsis "Traverse an ESTree-compliant AST")
    (description "Traverse an ESTree-compliant AST")
    (license license:expat)))

(define-public node-source-map-0.6.1
  (package
    (name "node-source-map")
    (version "0.6.1")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/source-map/-/source-map-0.6.1.tgz")
        (sha256
          (base32
            "11ib173i7xf5sd85da9jfrcbzygr48pppz5csl15hnpz2w6s3g5x"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/mozilla/source-map")
    (synopsis "Generates and consumes source maps")
    (description
      "Generates and consumes source maps")
    (license license:bsd-3)))

(define-public node-vue-compiler-core-3.2.47
  (package
    (name "node-vue-compiler-core")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/compiler-core/-/compiler-core-3.2.47.tgz")
        (sha256
          (base32
            "105ccnnb5fncipn3x3c671g3mbc7d82afn0yw3cmhbjhzajizyj0"))))
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
      `(("node-source-map" ,node-source-map-0.6.1)
        ("node-estree-walker" ,node-estree-walker-2.0.2)
        ("node-babel-parser" ,node-babel-parser-7.20.15)
        ("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/compiler-core#readme")
    (synopsis "vue/compiler-core")
    (description "vue/compiler-core")
    (license license:expat)))

(define-public node-vue-compiler-dom-3.2.47
  (package
    (name "node-vue-compiler-dom")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/compiler-dom/-/compiler-dom-3.2.47.tgz")
        (sha256
          (base32
            "05xzlnh0fgrxm67p4p4ngjfrp46zz74y9cbbajs49ik79hd5cvkv"))))
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
      `(("node-vue-compiler-core"
         ,node-vue-compiler-core-3.2.47)
        ("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/compiler-dom#readme")
    (synopsis "vue/compiler-dom")
    (description "vue/compiler-dom")
    (license license:expat)))

(define-public node-vue-compiler-ssr-3.2.47
  (package
    (name "node-vue-compiler-ssr")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/compiler-ssr/-/compiler-ssr-3.2.47.tgz")
        (sha256
          (base32
            "149xqx2zn934bhgqs2bnsdyzr90fss4285ifp0jdmb8lfyhnhyq0"))))
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
      `(("node-vue-compiler-dom"
         ,node-vue-compiler-dom-3.2.47)
        ("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/compiler-ssr#readme")
    (synopsis "vue/compiler-ssr")
    (description "vue/compiler-ssr")
    (license license:expat)))

(define-public node-vue-server-renderer-3.2.47
  (package
    (name "node-vue-server-renderer")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/server-renderer/-/server-renderer-3.2.47.tgz")
        (sha256
          (base32
            "0yi0i3qvm0sjh8h3y68v3j1vlblj20446whz5w07kijkq6vynqf7"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (add-after 'unpack 'patch-for-newer-quickcheck
           (lambda _
             ;; Remove circular dependency on vue.
             (substitute* "package.json"
               (("\"vue\": \"[^\"]+\"")
                ""))))
          (delete 'build))))
    (inputs
      `(("node-vue-compiler-ssr"
         ,node-vue-compiler-ssr-3.2.47)
        ("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/server-renderer#readme")
    (synopsis "vue/server-renderer")
    (description "vue/server-renderer")
    (license license:expat)))

(define-public node-vue-3.2.47
  (package
    (name "node-vue")
    (version "3.2.47")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/vue/-/vue-3.2.47.tgz")
        (sha256
          (base32
            "08yyvmkak884hgwzjxky9fnc60xmav0lpmf18z9ycqci14why9vh"))))
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
      `(("node-vue-server-renderer"
         ,node-vue-server-renderer-3.2.47)
        ("node-vue-compiler-sfc"
         ,node-vue-compiler-sfc-3.2.47)
        ("node-vue-runtime-dom"
         ,node-vue-runtime-dom-3.2.47)
        ("node-vue-compiler-dom"
         ,node-vue-compiler-dom-3.2.47)
        ("node-vue-shared" ,node-vue-shared-3.2.47)))
    (home-page
      "https://github.com/vuejs/core/tree/main/packages/vue#readme")
    (synopsis
      "The progressive JavaScript framework for building modern web UI.")
    (description
      "The progressive JavaScript framework for building modern web UI.")
    (license license:expat)))

(define-public node-vue-devtools-api-6.5.0
  (package
    (name "node-vue-devtools-api")
    (version "6.5.0")
    (source
      (origin
        (method url-fetch)
        (uri "https://registry.npmjs.org/@vue/devtools-api/-/devtools-api-6.5.0.tgz")
        (sha256
          (base32
            "061krjky1g52wf1sgzlyv7f62xz10vd6i4ipblpnmk3hx0s9qylx"))))
    (build-system node-build-system)
    (arguments
      `(#:tests?
        #f
        #:phases
        (modify-phases
          %standard-phases
          (delete 'configure)
          (delete 'build))))
    (home-page
      "https://github.com/vuejs/vue-devtools#readme")
    (synopsis
      "Interact with the Vue devtools from the page")
    (description
      "Interact with the Vue devtools from the page")
    (license license:expat)))

