import React from "react";
import "../../style/DefaultButton.css"
import "../../style/BookMainPage.css"
import "../../style/warning.css"

class Donation extends React.Component {
    state = {
        donationAmount: 0
    }

    /**
     * Formats the input into a currency (xxx.xx) where x are numbers.
     * @param value
     * @returns {string}
     */
    formatCurrency(value) {
        const index = value.toString().indexOf(".");

        // The period can't be the first character
        if (index === 0) {
            value = ""
        }

        if (index > 0 && index + 2 + 1 < value.length) {
            value = value.substring(0, index + 2 + 1);
        }


        return value;
    }

    /**
     * Submits the donation.
     */
    submitDonation() {
        // This should be a web call
        // Should send the donationAmount to the target user.
        if (this.state.donationAmount <= 0) {
            window.alert("Please enter a donation!");
            return;
        }

        this.setState({donationAmount: 0})
        this.props.submitDonation();
    }

    render() {
        return (
            <div className="popup-box">
                <div className="box-small">
                    <p>Please enter a donation amount.</p>

                    <label>$</label>
                    <input type="number" value={this.formatCurrency(this.state.donationAmount)}
                           onChange={(e) => this.setState({donationAmount: e.target.value})}/>

                    <div>
                        <button className={"defaultButton donationButton"} onClick={(e) => {
                            this.submitDonation()
                        }}>Send
                        </button>

                        <button className={"defaultButton donationButton"}
                                onClick={(e) => this.props.cancelDonation()}>Cancel
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Donation;