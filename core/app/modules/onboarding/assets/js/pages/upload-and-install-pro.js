import { useCallback, useEffect, useState } from 'react';
import useAjax from 'elementor-app/hooks/use-ajax';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import Content from '../../../../../assets/js/layout/content';
import DropZone from '../../../../../assets/js/organisms/drop-zone';
import Notice from '../components/notice';

export default function UploadAndInstallPro() {
	usePageTitle( { title: __( 'Upload and Install Elementor Pro', 'elementor' ) } );

	const { ajaxState: installProZipAjaxState, setAjax: setInstallProZipAjaxState } = useAjax(),
		[ noticeState, setNoticeState ] = useState( null ),
		[ fileSource, setFileSource ] = useState();

	const uploadProZip = useCallback( ( file ) => {
		setInstallProZipAjaxState( {
			data: {
				action: 'elementor_upload_and_install_pro',
				fileToUpload: file,
			},
		} );
	}, [] );

	const setErrorNotice = ( error = null ) => {
		const errorMessage = error?.message || 'That didn\'t work. Try uploading your file again.';

		elementorCommon.events.dispatchEvent( {
			event: 'indication prompt',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
				action_state: 'failure',
				action: 'install pro',
			},
		} );

		setNoticeState( {
			type: 'error',
			icon: 'eicon-warning',
			message: errorMessage,
		} );
	};

	/**
	 * Ajax Callbacks
	 */
	// Run the callback that runs when the Pro Upload Ajax returns a response.
	useEffect( () => {
		if ( 'initial' !== installProZipAjaxState.status ) {
			if ( 'success' === installProZipAjaxState.status && installProZipAjaxState.response?.elementorProInstalled ) {
				elementorCommon.events.dispatchEvent( {
					event: 'pro uploaded',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						source: fileSource,
					},
				} );

				if ( opener && opener !== window ) {
					opener.jQuery( 'body' ).trigger( 'elementor/upload-and-install-pro/success/' );

					window.close();
					opener.focus();
				}
			} else if ( 'error' === installProZipAjaxState.status ) {
				setErrorNotice();
			}
		}
	}, [ installProZipAjaxState.status ] );

	const onProUploadHelpLinkClick = () => {
		elementorCommon.events.dispatchEvent( {
			event: 'pro plugin upload help',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
			},
		} );
	};

	return (
		<div className="eps-app e-onboarding__upload-pro">
			<Content>
				<DropZone
					className="e-onboarding__upload-pro-drop-zone"
					onFileSelect={ ( file, event, source ) => {
						setFileSource( source );
						uploadProZip( file );
					} }
					onError={ ( error ) => setErrorNotice( error ) }
					filetypes={ [ 'zip' ] }
					buttonColor="cta"
					buttonVariant="contained"
					heading={ __( 'Import you Elementor Pro plugin file', 'elementor' ) }
					text={ __( 'Drag & Drop your .zip file here', 'elementor' ) }
					secondaryText={ __( 'or', 'elementor' ) }
					buttonText={ __( 'Browse', 'elementor' ) }
				/>
				{ noticeState && <Notice noticeState={ noticeState }/> }
				<div className="e-onboarding__upload-pro-get-file">
					{ __( 'Don\'t know where to get the file from?', 'elementor' ) + ' ' }
					{/* eslint-disable-next-line react/jsx-no-target-blank */}
					<a onClick={ () => onProUploadHelpLinkClick() } href={ 'https://my.elementor.com/subscriptions/' + elementorAppConfig.onboarding.utms.downloadPro } target="_blank">
						{ __( 'Click here', 'elementor' ) }
					</a>
				</div>
			</Content>
		</div>
	);
}
