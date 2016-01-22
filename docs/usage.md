Usage:
    gramchk FILE [ -n NUM ] [ -l ] [ -a ] [ -d N ] [ -x ]
    gramchk ( -h | --help )

Options:
    -h, --help              help for gramchk
    -n, --num NUM           maximum number of errors (50)
    -l, --latex             unsugar latex
    -x, --huntex            use `huntex` to unsugar latex
    -a, --auto              detect input file
    -d, --dump NUM          dump intermediate phase (1: unsugar)

Commands:

Arguments:
    FILE                    file to check

Description:

    Additional rules can be specified in a `.gramchk.yml' file, in the same
    directory of the source file.
