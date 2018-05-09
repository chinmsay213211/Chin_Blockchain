create table packing_list_items
(
	id serial not null
	constraint packing_list_items_pkey primary key,
	no integer,
	product_name varchar(128),
	lot_number varchar(32),
	qty integer,
	net_wt double precision,
	gross_wt double precision,
	packing_list_id integer,
	product_code varchar(32)
)
;

create unique index packing_list_items_id_uindex
	on packing_list_items (id)
;

create table packing_list
(
	id serial not null
		constraint packing_list_pkey
			primary key,
	shipper text,
	ship_to text,
	dispatch_no varchar(128),
	date date,
	driver_name varchar(128),
	vehicle_no varchar(128),
	container_no varchar(128),
	issued_by varchar(128),
	shipments_total_net_weight double precision,
	shipments_total_gross_weight double precision,
	volume double precision,
	no_of_packages integer,
	product_received_in_good_condit varchar(128)
)
;

create unique index packing_list_id_uindex
	on packing_list (id)
;

alter table packing_list_items
	add constraint packing_list_items_packing_list_id_fk
		foreign key (packing_list_id) references packing_list
;

create table product_scans
(
	id serial not null
		constraint product_scans_pkey
			primary key,
	exceed_code varchar(128),
	product_code varchar(128),
	status varchar(128),
	rack_id integer,
	pallet_id integer,
	packing_list_item_id integer
		constraint product_scans_packing_list_items_id_fk
			references packing_list_items
)
;

create unique index product_scans_id_uindex
	on product_scans (id)
;

create table delivery_advice
(
	id serial not null
		constraint delivery_advice_pkey
			primary key,
	customer_bill_to varchar(128),
	shipped_to varchar(128),
	invoice_no integer,
	el_order_no integer,
	trip_no integer,
	sales_person varchar(128),
	your_order_ref integer,
	buyer_name varchar(128),
	date date,
	due_date date,
	currency varchar(16),
	db_datetime timestamp,
	db_vehicle_no varchar(128),
	db_name varchar(128),
	db_signature varchar(128),
	rb_name varchar(128),
	b_designation varchar(128),
	rb_id_details varchar(128),
	siganture_company_stamp varchar(128)
)
;

create unique index delivery_advice_id_uindex
	on delivery_advice (id)
;

create table delivery_advice_items
(
	id serial not null
		constraint delivery_advice_items_pkey
			primary key,
	item_code varchar(128),
	product_description varchar(128),
	uom varchar(128),
	batch_number varchar(128),
	shipped_qty integer,
	confirmed_qty integer,
	volume integer,
	unit_price double precision,
	total_value double precision,
	delivery_advice_id integer
		constraint delivery_advice_items_delivery_advice_id_fk
			references delivery_advice
)
;

create unique index delivery_advice_items_id_uindex
	on delivery_advice_items (id)
;

create table asn
(
	id serial not null
		constraint asn_pkey
			primary key,
	storer varchar(128),
	supplier varchar(128),
	receiving_door varchar(128),
	container_type varchar(128),
	cust_ref varchar(128),
	po_no varchar(128),
	seal varchar(128),
	qty integer,
	cust_po_no varchar(128),
	asn_no varchar(128),
	asn_type varchar(128),
	created_by varchar(128),
	return_reason varchar(128),
	storer_class varchar(128),
	receipt_srl_no varchar(128),
	dispatch_no varchar(128)
)
;

create unique index asn_id_uindex
	on asn (id)
;

create table asn_items
(
	id serial not null
		constraint asn_items_pkey
			primary key,
	sku varchar(128),
	description varchar(128),
	uom varchar(128),
	p_qty varchar(128),
	units varchar(128),
	ti varchar(128),
	hi varchar(128),
	expected varchar(128),
	recvd varchar(128),
	foc varchar(128),
	rejected varchar(128),
	expiary varchar(128),
	l_ varchar(128),
	w_ varchar(128),
	h_ varchar(128),
	each_ varchar(128),
	ip varchar(128),
	case_ varchar(128),
	pallet varchar(128),
	qty_in_cases varchar(128),
	retail_sku varchar(128),
	notes varchar(128),
	mro varchar(128),
	line_no varchar(128),
	priority varchar(128),
	site_code varchar(128),
	gp_tag varchar(128),
	qa_qs_flag varchar(128),
	gp_flag varchar(128),
	asn_id integer
		constraint asn_items_asn_id_fk
			references asn
)
;

create unique index asn_items_id_uindex
	on asn_items (id)
;

create table delivery_voucher
(
	id serial not null
		constraint delivery_voucher_pkey
			primary key,
	no varchar(128),
	date date,
	customer varchar(128),
	vehicle varchar(128),
	order_ref integer,
	openning_km integer,
	closing_km integer,
	total_km integer,
	tristar_out varchar(128),
	tristar_in varchar(128),
	working_hrs varchar(128),
	rest_hrs varchar(128),
	total_driving_hrs varchar(128),
	pdn_no integer,
	no_of_drops integer,
	driver varchar(128),
	drv varchar(128),
	veh varchar(128),
	ath integer
)
;

create unique index delivery_voucher_id_uindex
	on delivery_voucher (id)
;

create table delivery_voucher_items
(
	id serial not null
		constraint delivery_voucher_items_pkey
			primary key,
	s_no integer,
	product varchar(128),
	qty integer,
	trip_from varchar(128),
	trip_to varchar(128),
	drop_no integer,
	site_in varchar(128),
	site_out varchar(128),
	delivery_voucher_id integer
		constraint delivery_voucher_items_delivery_voucher_id_fk
			references delivery_voucher
)
;

create unique index delivery_voucher_items_id_uindex
	on delivery_voucher_items (id)
;

create table receipt_confirmation
(
	id serial not null
		constraint receipt_confirmation_pkey
			primary key,
	aglty_asn varchar(128),
	aglty_po varchar(128),
	container varchar(128),
	warehouse_ref varchar(128),
	cust_code varchar(128),
	cust_name varchar(128),
	cust_ref varchar(128),
	receipt_srl integer,
	supplier_code varchar(128),
	supplier_name varchar(128),
	cust_po varchar(128),
	asn_close_date varchar(128),
	carrier_code varchar(128),
	carrier_name varchar(128),
	storer_class varchar(128),
	asn_last_activity varchar(128),
	print_date varchar(128),
	asn_created_by varchar(128),
	asn_created_date varchar(128),
	dispatch_no varchar(128)
)
;

create unique index receipt_confirmation_id_uindex
	on receipt_confirmation (id)
;

create table receipt_confirmation_items
(
	id serial not null
		constraint receipt_confirmation_items_pkey
			primary key,
	commodity varchar(128),
	description varchar(128),
	expected integer,
	received integer,
	foc integer,
	rejected integer,
	expiry_dt varchar(128),
	coo integer,
	batch_no varchar(128),
	uom varchar(128),
	receipt_status varchar(128),
	cbm varchar(128),
	receipt_confirmation_id integer
		constraint receipt_confirmation_items_receipt_confirmation_id_fk
			references receipt_confirmation
)
;

create unique index receipt_confirmation_items_id_uindex
	on receipt_confirmation_items (id)
;

