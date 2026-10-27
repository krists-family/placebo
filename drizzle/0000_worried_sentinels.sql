CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`personalization` text DEFAULT '' NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "quantity_positive" CHECK("cart_items"."quantity" > 0 AND "cart_items"."quantity" <= 99)
);
--> statement-breakpoint
CREATE INDEX `cart_items_cart` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cart_item_identity` ON `cart_items` (`cart_id`,`variant_id`,`personalization`);--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`country` text DEFAULT 'es' NOT NULL,
	`code` text DEFAULT '' NOT NULL,
	`order_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `carts_visitor_status` ON `carts` (`visitor_id`,`status`);--> statement-breakpoint
CREATE TABLE `discounts` (
	`code` text PRIMARY KEY NOT NULL,
	`percent` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`min_amount` integer DEFAULT 0 NOT NULL,
	`usage_limit` integer DEFAULT 1000000000 NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "discount_usage_limit" CHECK("discounts"."used" <= "discounts"."usage_limit"),
	CONSTRAINT "discount_percent_range" CHECK("discounts"."percent" >= 1 AND "discounts"."percent" <= 100)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`team` text NOT NULL,
	`quantity` integer NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`cart_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'placed' NOT NULL,
	`payment_status` text DEFAULT 'test' NOT NULL,
	`subtotal` integer NOT NULL,
	`discount` integer NOT NULL,
	`shipping` integer NOT NULL,
	`total` integer NOT NULL,
	`code` text DEFAULT '' NOT NULL,
	`items` text NOT NULL,
	`address` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`tracking` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_cart` ON `orders` (`cart_id`);--> statement-breakpoint
CREATE INDEX `orders_created` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `orders_email` ON `orders` (`email`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`description` text NOT NULL,
	`color` text NOT NULL,
	`color_hex` text NOT NULL,
	`image` text NOT NULL,
	`price` integer NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_price_nonnegative" CHECK("products"."price" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`email` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`title` text NOT NULL,
	`sku` text NOT NULL,
	`price` integer NOT NULL,
	`stock` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "stock_nonnegative" CHECK("variants"."stock" >= 0),
	CONSTRAINT "variant_price_nonnegative" CHECK("variants"."price" >= 0)
);
--> statement-breakpoint
CREATE INDEX `variants_product` ON `variants` (`product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku` ON `variants` (`sku`);