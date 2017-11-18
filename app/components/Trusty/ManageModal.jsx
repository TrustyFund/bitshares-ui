import React from "react";
import BaseModal from "components/Modal/BaseModal";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";

class ManageModal extends React.Component {

	render(){
	    return <BaseModal ref={"model"} id={this.props.modalId} ref="modal" overlay={true} overlayClose={false}>
	    	<h1 onClick={()=>{ZfApi.publish("trusty_manage_modal", "close")}}>Привет</h1>
        </BaseModal>

	}

}

ManageModal.defaultProps = {
    modalId: "trusty_manage_modal"
};

export default ManageModal