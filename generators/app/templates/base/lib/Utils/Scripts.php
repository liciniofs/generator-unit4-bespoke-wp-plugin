<?php

namespace <%= namespace %>\Utils;

class Scripts {

	/**
	 * Current plugin path.
	 *
	 * @var string
	 */
	private $plugin_path;

	/**
	 * The site url.
	 *
	 * @var string
	 */
	private $site_url;

	public function __construct() {
		$this->plugin_path = plugins_url() . '/<%= plugin_name %>/assets/js/';
		$this->site_url    = get_home_url();
	}

	/**
	 * Make site url available for js.
	 *
	 * @return void
	 */
	public function set_site_url() {
		$data = [
			'site_url'        => $this->site_url,
			'site_plugin_url' => plugin_dir_url(),
		];
		error_log( print_r( $data, true ) );
		wp_enqueue_script( 'sm-portal-ui' );
		wp_localize_script( 'sm-portal-ui', '<%= plugin_name %>_url', $data );
	}

	/**
	 * Undocumented function
	 *
	 * @return void
	 */
	public function load_scripts() {
		global $post;
		$this->load_page( $post->ID );
		$this->set_site_url();
	}

	/**
	 * Undocumented function
	 *
	 * @param [type] $page_id
	 * @return void
	 */
	public function load_page( $page_id ) {

		switch ( $page_id ) {
			case '662':
				# code...
				break;
			case '668':
				$this->page_668( $page_id );
				break;
			default:
				# code...
				break;
		}
	}

	/**
	 * Load scripts needed for Inquiry page.
	 *
	 * @return void
	 */
	private function page_668( $page_id ) {

		/**
		 * key -> file path inside plugin
		 * value -> is it should be loaded from u4sm-adaptor or customization
		 *          -> true -> u4sm-adaptor
		 *          -> false -> u4sm-aultman
		 */
		$files = [
			'sm.portal.utility.js'                      => false,
			'models/SMAPI.community.combined-1.0.0.js'  => true,
			'models/SMAPI.academic.combined-1.0.0.js'   => true,
			'models/SMAPI.admissions.combined-1.0.0.js' => true,
			'viewmodels/community/sm.portal.vm.addressTemplateCountry.js' => true,
			'viewmodels/community/sm.portal.vm.mailingAddress.js' => true,
			'viewmodels/community/sm.portal.vm.electronicAddress.js' => true,
			'viewmodels/community/sm.portal.vm.phoneNumber.js' => true,
			'viewmodels/common/sm.portal.vm.account.js' => true,
			'viewmodels/admissions/sm.portal.vm.matrixListItem.js' => true,
			'viewmodels/admissions/sm.portal.vm.inquiry.js' => false,
			'pages/sm.portal.page.inquiry.js'           => false,
		];

		$i = 0;
		foreach ( $files as $file_name => $load_original ) {
			$this->enqueue_scripts( $file_name, $load_original, $i );
			$i++;
		}
	}

	/**
	 * Undocumented function
	 *
	 * @param string $path Relative path to file.
	 * @return void
	 */
	private function enqueue_scripts( $file_name, $load_original, $index ) {

		$plugin_path = $this->plugin_path;

		if ( $load_original === true ) {
			$plugin_path = plugins_url() . '/U4SM-adaptor/assets/js/';
		}

		wp_enqueue_script( "sm-portal-jsfile-{$index}", $plugin_path . $file_name, array(), '1.0', true );
	}

	private function load_defaults() {

		wp_deregister_script( 'sm-portal-utility' );
		wp_deregister_script( 'sm-portal-constants' );
		wp_deregister_script( 'sm-portal-ui-combobox' );
		wp_deregister_script( 'sm-api-access' );
		wp_deregister_script( 'sm-portal-slidepane' );
		wp_deregister_script( 'sm-public-script' );
		wp_deregister_script( 'sm-keyboardnav' );
		wp_deregister_script( 'sm-widget-standardization' );

		wp_register_script( 'sm-portal-constants', $this->plugin_path . '/assets/js/smapi.constants.js', array( 'sm-portal-utility' ) );
		wp_register_script( 'sm-portal-ui-combobox', $this->plugin_path . '/assets/js/ui/sm.portal.ui.combobox.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-widget', 'sm-portal-utility' ) );
		wp_register_script( 'sm-api-access', $this->plugin_path . '/assets/js/smapi.access.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-widget', 'sm-portal-utility' ) );
		wp_register_script( 'sm-portal-ui', $this->plugin_path . '/assets/js/ui/sm.portal.ui.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-widget', 'sm-portal-utility' ) );
		wp_register_script( 'sm-portal-utility', $this->plugin_path . '/assets/js/sm.portal.utility.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-widget', 'sm-portal-utility' ) );
		wp_register_script( 'sm-portal-slidepane', $this->plugin_path . '/assets/js/ui/sm.portal.ui.slidepane.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-widget', 'sm-portal-utility' ) );

		wp_register_script( 'sm-public-script', $this->plugin_path . '/public/js/sm.portal.plugin.public.js', array( 'sm-portal-utility' ) );
		wp_register_script( 'sm-keyboardnav', $this->plugin_path . '/assets/js/ui/sm.portal.keyboardNav.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-widget', 'sm-portal-utility' ) );
		wp_register_script( 'sm-widget-standardization', $this->plugin_path . '/assets/js/ui/sm.portal.prototype.widget-functions.js', array( 'jquery', 'jquery-ui-core', 'jquery-ui-widget', 'sm-portal-utility' ) );

	}
}
