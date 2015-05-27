#!/usr/bin/env perl
#APos: APosDoc=1.6
#*
#* Info:
#* Author: Pawel Guspiel (neo) <pawel.guspiel@hurra.com>
#* Owner: Pawel Guspiel (neo) <pawel.guspiel@hurra.com>
#*
# FIXME (autoACR): update Info field

use strict;
use warnings;
use utf8;

our $VERSION = 1.0;
use FCGI;           # fastcgi
use Digest::MD5;    # md5 for token
use JSON;           # json opp
use DBI;            # db interface

#=------------------------------------------------------------------------( use, constants )

use FindBin qw/$Bin/;
use RESTWebservice;

# FIXME (autoACR): write why are you using RESTWebservice (do you realy need it?)

#=------------------------------------------------------------------------( functions )

sub db_connect {
    my $dsn = 'DBI:mysql:database=quchnia;host=localhost';
    return DBI->connect( $dsn, 'quchnia', 'quchnia', { auto_reconnect => 1, set_names => 'utf8'} );

}

sub error {
    return { error_msg => shift };
}

sub items_list {
   
    my $dbh = db_connect;
    my $sql = 'SELECT * FROM items';
    my $items = $dbh->selectall_arrayref($sql, { Slice => {} });
    for my $item (@$items) {
        my $sql = 'SELECT * FROM images where item_hash = ?';
        my $images = $dbh->selectall_arrayref($sql, { Slice => {} }, $item->{'hash'});
        $item->{'images'} = $images; 
    }
    
    $dbh->disconnect;
    
    return $items;
}

sub item_get {
    my %p_ = @_;

    my $dbh = db_connect;
    my $sql = 'SELECT * FROM items where hash = ?';
    my $item = ($dbh->selectall_arrayref($sql, { Slice => {} }, $p_{'hash'}))->[0];
    
    return error('Przedmiot ('.$p_{'hash'}.') nie istnieje (jeszcze ;)') unless $item;
    $sql = 'SELECT * FROM images where item_hash = ?';
    my $images = $dbh->selectall_arrayref($sql, { Slice => {} }, $p_{'hash'});
    $item->{'images'} = $images; 
    
    $dbh->disconnect;
    
    return $item;
    
}

sub item_add {
    my %p_ = @_;

    my $dbh = db_connect;
    my $sql = 'INSERT INTO items(title, about, about_me, create_date) values(?,?,?,now())';
    my $query = $dbh->prepare($sql);
    $query->execute($p_{'title'}, $p_{'about'}, $p_{'about_me'}); 
    my $hash = $dbh->{'mysql_insertid'}; 
    for my $image (@{$p_{'images'}}) {
        my $sql = 'INSERT INTO images(item_hash, path) values(?,?)';
        my $query = $dbh->prepare($sql);
        $query->execute($hash, $image->{'path'}); 
    }
    $dbh->disconnect;
    
    return { hash => $hash };

}

sub _item_update {
    my %p_ = @_;

    my (@fields, @values);
    for my $key (keys %p_) {
        if ($key =~ /^(title|about|about_me|state|stars)$/) {
            push @fields, "`$key`=?";
            push @values, $p_{$key};
        }
    }
    my $dbh = db_connect;
    my $sql = 'UPDATE items SET '.join(',', @fields).' WHERE hash = ?';
    my $query = $dbh->prepare($sql);
    $query->execute(@values, $p_{'hash'}); 
#    for my $image (@{$p_{'images'}}) {
#        my $sql = 'INSERT INTO images(item_hash, path) values(?,?)';
#        my $query = $dbh->prepare($sql);
#        $query->execute($hash, $image->{'path'}); 
#    }

    $dbh->disconnect;
    return { hash => $p_{'hash'} };

}

sub item_update {
    _item_update(@_);
}

sub item_accept {
    my %p_ = @_;
    _item_update(hash => $p_{'hash'}, state => 'accepted');
}

sub item_reject {
    my %p_ = @_;
    _item_update(hash => $p_{'hash'}, state => 'rejected');
}
#=------------------------------------------------------------------------( main )

#=--------
#  start
#=--------
#* start webservice loop
#* RETURN: OK
sub start {
    my $header  = "Content-type: text/x-json; charset=utf8\r\n\r\n";
    my $request = FCGI::Request();

    my $response;
    while ( $request->Accept >= 0 ) {

        my $env = $request->GetEnvironment;

        $response = 
        get( '/items' => \&items_list, $env )
        ||
        get( '/item/get/:hash' => \&item_get, $env )
        || 
        post( '/item/add' => \&item_add, $env )
        ||
        put( '/item/update/:hash' => \&item_update, $env )
        ||
        get( '/item/accept/:hash' => \&item_accept, $env )
        ||
        get( '/item/reject/:hash' => \&item_reject, $env )
        || 
        error('Niepoprawna funkcja, tez mi troche przykro.. ale nie az tak');

        #  } continue {

        # --- print output ---
        print $header;
        print JSON::encode_json( $response );
        $request->Finish;

    } #+ end of: continue

    return 1;
} #+ end of: sub start
start;
