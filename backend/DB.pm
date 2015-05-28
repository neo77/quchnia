#!/usr/bin/env perl
#APos: APosDoc=1.5
#*
#* Name: Liban::Webservice
#* Info: Webservice main lib
#* Owner: Pawel Guspiel (neo77), <neo@cpan.org>
#*
package DB;

use strict;
use warnings;

use DBI;    # db interface

# --- version ---

#=------------------------------------------------------------------------( use, constants )

# --- Headers ---

#=-------------
#  db_connect
#=-------------
#* put_description_here
#* RETURN: put_return_value_here
sub db_connect {
    my $dsn = 'DBI:mysql:database=neo77_kuchnia;host=localhost';
    return DBI->connect( $dsn, 'neo77_kuchnia', 'X9eVAdwA', { auto_reconnect => 1, set_names => 'utf8' } );

} #+ end of: sub db_connect

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

