import * as React from "react";

const appStyles = require("./App.css");

interface IUserPrefs {
  colorful: boolean;
  favoriteColor: string;
}

class App extends React.Component<{}, { prefs: IUserPrefs }> {

  constructor(props: {}) {
    super(props);
    // init state with default values
    this.state = {
      prefs: {
        colorful: false,
        favoriteColor: "red",
      },
    };
  }

  public componentWillMount() {
    // read options from storage, with default values
    chrome.storage.sync.get(["favoriteColor", "colorful"], (items: IUserPrefs) => {
      this.setState({ prefs: items });
      console.log("options loaded", items);
    });
  }

  public render() {
    return (
      <div className={appStyles.app}>
        <div>
          <label>Favorite color</label>
          <select onChange={this.handleSelectChange} value={this.state.prefs.favoriteColor}>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="yellow">Yellow</option>
          </select>
        </div>
        <div>
          <label>Colorful background</label>
          <input type="checkbox" checked={this.state.prefs.colorful} onChange={this.handleCheckboxChange} />
        </div>
        <div>
          <button onClick={this.handleSaveClick}>Save</button>
        </div>
      </div>
    );
  }

  private handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      prefs: {
        colorful: this.state.prefs.colorful,
        favoriteColor: e.target.value,
      },
    });
  }

  private handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      prefs: {
        colorful: e.target.checked,
        favoriteColor: this.state.prefs.favoriteColor,
      },
    });
  }

  private handleSaveClick = () => {
    // save options
    chrome.storage.sync.set(this.state.prefs, () => {
      // notify user that settings are saved
      console.log("options saved", this.state.prefs);
    });
  }

}

export default App;
