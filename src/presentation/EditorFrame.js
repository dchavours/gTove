import React, {Component} from 'react';
import PropTypes from 'prop-types';

class EditorFrame extends Component {

    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired,
        className: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            saving: false
        };
    }

    render() {
        if (this.state.saving) {
            return (
                <div>
                    <span>Saving...</span>
                </div>
            );
        } else {
            return (
                <div className={this.props.className}>
                    <div>
                        <button onClick={this.props.onClose}>Cancel</button>
                        <button onClick={() => {
                            this.setState({saving: true});
                            this.props.onSave()
                                .then(() => {
                                    this.setState({saving: false});
                                    this.props.onClose();
                                })
                        }}>Save</button>
                    </div>
                    {
                        this.props.children
                    }
                </div>
            );
        }
    }
}

export default EditorFrame;