#!/bin/bash
BASE="$(cd `dirname "$0"` && pwd)"

main () {
    local cmd="$1"
    case $cmd in
        'setup')
            shift
            setup "$@"
            ;;
        'test')
            shift
            run_tests "$@"
            ;;
        'clean')
            shift
            clean "$@"
            ;;
        * )
            echo "
Exiting without running any operations.
Possible operations include:

  setup - Install dependencies.
    Usage: ./manage.sh setup

  test - Run tests.
    Usage: ./manage.sh test

  clean - Remove everything generated by this script.
    Usage: ./manage.sh clean
            "
            ;;
    esac
}

setup () {
    if ! [ -d "$BASE/node_modules" ]; then
        cd "$BASE/"
        mkdir "$BASE/node_modules"
        npm install
    fi
}

run_tests () {
    setup
    node $BASE/management/run_globals_test.js test/
    node $BASE/management/run_tests.js test/
}

clean () {
    rm -rf "$BASE/node_modules/"
    echo "removed ./node_modules/"
}

main "$@"
