#!/usr/bin/env perl
#APos: APosDoc=1.5
#*
#* Name: Liban::Webservice
#* Info: Webservice main lib
#* Owner: Pawel Guspiel (neo77), <neo@cpan.org>
#*
package RESTWebservice;

use strict;
use warnings;

use JSON;    # json opp

use Exporter;    # to export _ rq and opt
our @ISA    = qw(Exporter);
our @EXPORT = qw(put post get delete);

# --- version ---

#=------------------------------------------------------------------------( use, constants )

# --- Headers ---

# --- cpan libs ---
#=----------------------
#  _get_encoded_params
#=----------------------
#* put_description_here
#* RETURN: put_return_value_here
sub _get_encoded_params {
    my $p_content_length = shift;

    my $json_txt = '';
    my %params;

    read( STDIN, $json_txt, $p_content_length );

    %params = %{ JSON::decode_json( $json_txt ) || {} };

    return %params;
} #+ end of: sub _get_encoded_params

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

#=--------------
#  _get_params
#=--------------
#* put_description_here
#* RETURN: put_return_value_here
sub _get_params {
    my ( $p_query_tmpl, $p_query_rx, $p_env ) = @_;

    $p_query_tmpl =~ s/^\///;

    my $qs = $p_env->{ 'QUERY_STRING' };

#    $qs =~ s/\/$//;

    my %params;
    my ( @query_keys ) = $p_query_tmpl =~ /:([^\/]+)/g;

    if ( scalar @query_keys ) {
        my ( @query_values ) = $qs =~ m{$p_query_rx}g;
        s/%(..)/chr(hex($1))/ge for @query_values;

        @params{ @query_keys } = @query_values;
    } #+ end of: if ( scalar @query_keys)

    if ( $p_env->{ 'REQUEST_METHOD' } eq 'POST' or $p_env->{ 'REQUEST_METHOD' } eq 'PUT' ) {
        my %post_params = _get_encoded_params( $p_env->{ 'CONTENT_LENGTH' } );
        %params = ( %params, %post_params );
        use Data::Dumper;
        warn Data::Dumper->Dump( [ \%params ], ['params'] );
    } #+ end of: if ( $p_env->{ 'REQUEST_METHOD'...})

    return %params;
} #+ end of: sub _get_params

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

#=-----------
#  _request
#=-----------
#* put_description_here
#* RETURN: put_return_value_here
sub _request {
    my ( $p_query_tmpl, $p_callback, $p_env ) = @_;

    $p_query_tmpl =~ s/^\///;

    my $query_rx = $p_query_tmpl;
    $query_rx =~ s/:[^\/]+/([^\/]+)/g;

    if ( $p_env->{ 'QUERY_STRING' } =~ /$query_rx/ ) {
        &$p_callback( _get_params( $p_query_tmpl, $query_rx, $p_env ) );
    } else {
        return 0;
    } #+ end of: else [ if ( $p_env->{ 'QUERY_STRING'...})]
} #+ end of: sub _request

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

#=-------
#  post
#=-------
#* put_description_here
#* RETURN: put_return_value_here
sub post {
    my ( $p_query_tmpl, $p_callback, $p_env ) = @_;

    return unless $p_env->{ 'REQUEST_METHOD' } eq 'POST';

    _request( @_ );
} #+ end of: sub post

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

#=------
#  get
#=------
#* put_description_here
#* RETURN: put_return_value_here
sub get {
    my ( $p_query_tmpl, $p_callback, $p_env ) = @_;

    return unless $p_env->{ 'REQUEST_METHOD' } eq 'GET';

    _request( @_ );
} #+ end of: sub get

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

#=------
#  put
#=------
#* put_description_here
#* RETURN: put_return_value_here
sub put {
    my ( $p_query_tmpl, $p_callback, $p_env ) = @_;

    return unless $p_env->{ 'REQUEST_METHOD' } eq 'PUT';

    _request( @_ );
} #+ end of: sub put

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

#=---------
#  delete
#=---------
#* put_description_here
#* RETURN: put_return_value_here
sub delete {
    my ( $p_query_tmpl, $p_callback, $p_env ) = @_;

    return unless $p_env->{ 'REQUEST_METHOD' } eq 'DELETE';

    _request( @_ );
} #+ end of: sub delete

# TODO (autoACR): update function/group documentation at header (put_description_here)
# TODO (autoACR): update function documentation at header (put_return_value_here)

