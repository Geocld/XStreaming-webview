import { useState, useEffect, useRef } from "react";
import VConsole from "vconsole";
import { Button } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import Loading from "../../components/Loading";
import GamepadMapModal from "../../components/GamepadMapModal";
import MapItem from "../../components/MapItem";
import "./Map.css";

const defaultMaping = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  DPadUp: 12,
  DPadDown: 13,
  DPadLeft: 14,
  DPadRight: 15,
  LeftShoulder: 4,
  RightShoulder: 5,
  LeftThumb: 10,
  RightThumb: 11,
  LeftTrigger: 6,
  RightTrigger: 7,
  Menu: 9,
  View: 8,
  Nexus: 16,
};

const buttonLabels = [
  "A",
  "B",
  "X",
  "Y",
  "DPadUp",
  "DPadDown",
  "DPadLeft",
  "DPadRight",
  "LeftShoulder",
  "RightShoulder",
  "LeftTrigger",
  "RightTrigger",
  "LeftThumb",
  "RightThumb",
  "View",
  "Menu",
  "Nexus",
];

function Map() {
  const { t } = useTranslation();
  const [maping, setMaping] = useState(
    JSON.parse(JSON.stringify(defaultMaping))
  );
  const [current, setCurrent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [vconsole, setVconsole] = useState(undefined);
  const [streamSettings, setStreamSettings] = useState(null);

  const timer = useRef(null)

  useEffect(() => {
    document.body.style["overflow-y"] = "auto";
    document.body.style["position"] = "inherit";

    console.log("window.ReactNativeWebView:", window.ReactNativeWebView);

    if (!timer.current) {
      timer.current = setInterval(() => {
        console.log('window.streamSettings:', window.streamSettings);
        if (window.streamSettings) {
          try {
            const _streamSettings = JSON.parse(window.streamSettings);
            setStreamSettings(_streamSettings)
          } catch (e) {
            setStreamSettings({})
          }
          
          clearInterval(timer.current)
        }
      }, 500);
    }
    

    document.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      console.log("receive message:", message);
      if (message.type === "updateGlobalVariable") {
        console.log("Global variable updated:", message);
      }
    });

    if (streamSettings) {
      console.log('streamSettings:', streamSettings)
      if (streamSettings.gamepad_maping) {
        setMaping(streamSettings.gamepad_maping);
      }

      if (streamSettings.debug && vconsole === undefined) {
        setVconsole(new VConsole());
      }
    }

    return () => {
      if (vconsole !== undefined) {
        vconsole.destroy();
      }
    };
  }, [vconsole, streamSettings]);

  const [showModal, setShowModal] = useState(false);

  const handleMapConfirm = (name, idx) => {
    console.log(name, idx);
    setShowModal(false);
    setMaping({
      ...maping,
      [name]: idx,
    });
  };

  const handleMapPress = (name) => {
    setCurrent(name);
    setShowModal(true);
  };

  const handleSave = () => {
    console.log("maping:", maping);
    // setLoading(true);
    setLoadingText(t("Saving..."));
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "saveMaping",
          message: maping,
        })
      );
    // setTimeout(() => {
    //   setLoadingText(t("Saved"));
    //   setLoading(false);
    // }, 2000);
  };

  const handleReset = () => {
    console.log("handleReset");
    setMaping(defaultMaping);
  };

  return (
    <div className="map-page">
      {loading && <Loading loadingText={loadingText} />}

      {showModal && (
        <GamepadMapModal
          show={showModal}
          current={current}
          onConfirm={handleMapConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <div className="maps">
        {buttonLabels.map((name) => {
          return (
            <div className="maps-item" key={name}>
              <MapItem
                name={name}
                value={maping[name]}
                onPress={handleMapPress}
              />
            </div>
          );
        })}

        <div className="operate-btns">
          <Button color="primary" fullWidth onClick={handleSave}>
            {t("Save")}
          </Button>
          <Button color="default" fullWidth onClick={handleReset}>
            {t("Reset")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Map;
