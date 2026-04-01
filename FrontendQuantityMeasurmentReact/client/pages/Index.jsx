import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { apiFetch } from "../api";

const MEASUREMENT_TYPES = {
  LengthUnit: {
    id: "LengthUnit",
    name: "Length",
    icon: "✏️",
    units: ["FEET", "INCHES", "YARDS", "CENTIMETERS"],
  },
  WeightUnit: {
    id: "WeightUnit",
    name: "Weight",
    icon: "⚖️",
    units: ["KILOGRAM", "GRAM", "POUND"],
  },
  TemperatureUnit: {
    id: "TemperatureUnit",
    name: "Temperature",
    icon: "🌡️",
    units: ["CELSIUS", "FAHRENHEIT", "KELVIN"],
  },
  VolumeUnit: {
    id: "VolumeUnit",
    name: "Volume",
    icon: "💧",
    units: ["LITRE", "MILLILITRE", "GALLON"],
  },
};

function TypeSelector({
  selectedType,
  onTypeChange,
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold text-teal-600 mb-4 tracking-wide">
        CHOOSE TYPE
      </p>
      <div className="grid grid-cols-4 gap-3">
        {Object.keys(MEASUREMENT_TYPES).map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg
              transition-all duration-300 transform hover:scale-105
              ${
                selectedType === type
                  ? "border-2 border-teal-500 bg-white shadow-md"
                  : "border-2 border-gray-200 bg-gray-50 hover:border-teal-300"
              }
            `}
          >
            <span className="text-3xl mb-2">
              {MEASUREMENT_TYPES[type].icon}
            </span>
            <span className="text-xs font-medium text-gray-700">
              {MEASUREMENT_TYPES[type].name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionSelector({
  selectedAction,
  onActionChange,
}) {
  const actions = [
    { id: "comparison", name: "Comparison" },
    { id: "conversion", name: "Conversion" },
    { id: "arithmetic", name: "Arithmetic" },
  ];

  return (
    <div className="mb-8">
      <p className="text-xs font-semibold text-teal-600 mb-4 tracking-wide">
        CHOOSE ACTION
      </p>
      <div className="flex gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionChange(action.id)}
            className={`
              px-6 py-2 rounded-lg font-medium text-sm
              transition-all duration-300 transform hover:scale-105
              ${
                selectedAction === action.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
            `}
          >
            {action.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConversionInterface({
  type,
  action,
}) {
  const typeInfo = MEASUREMENT_TYPES[type];
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState(typeInfo.units[0]);
  const [toUnit, setToUnit] = useState(
    typeInfo.units[typeInfo.units.length - 1]
  );
  
  // Need to make sure the selected units exist when type changes
  useEffect(() => {
    setFromUnit(typeInfo.units[0]);
    setToUnit(typeInfo.units[typeInfo.units.length - 1]);
    setSecondUnit(typeInfo.units[0]);
  }, [type, typeInfo.units]);

  const [arithmeticOp, setArithmeticOp] = useState("add");
  const [secondValue, setSecondValue] = useState("1");
  const [secondUnit, setSecondUnit] = useState(typeInfo.units[0]);
  
  const [toValue, setToValue] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchApi = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const payload = {
          thisQuantityDTO: {
            value: parseFloat(fromValue) || 0,
            unit: fromUnit,
            measurementType: type,
          },
          thatQuantityDTO: {
            value: parseFloat(action === "arithmetic" || action === "comparison" ? secondValue : 0) || 0,
            unit: action === "arithmetic" || action === "comparison" ? secondUnit : toUnit,
            measurementType: type,
          },
        };

        let endpoint = "";
        
        if (action === "conversion") {
          endpoint = "/api/v1/quantities/convert";
          payload.thatQuantityDTO = {
            value: 0,
            unit: toUnit,
            measurementType: type
          };
        } else if (action === "comparison") {
          endpoint = "/api/v1/quantities/compare";
        } else if (action === "arithmetic") {
          if (arithmeticOp === "add") endpoint = "/api/v1/quantities/add";
          else if (arithmeticOp === "subtract") endpoint = "/api/v1/quantities/subtract";
          else if (arithmeticOp === "divide") endpoint = "/api/v1/quantities/divide";
          
          if (arithmeticOp === "add" || arithmeticOp === "subtract") {
              payload.targetUnitDTO = {
                  value: 0,
                  unit: toUnit,
                  measurementType: type
              };
          }
        }

        const data = await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (action === "comparison") {
          setToValue(data.resultString?.toUpperCase() === "TRUE" ? "Equal" : "Not Equal");
        } else {
          setToValue(data.resultValue != null ? data.resultValue.toFixed(4).replace(/\.?0+$/, "") : "0");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Error computing value");
      } finally {
        setIsLoading(false);
      }
    };

    // Use a small timeout to debounce fetch
    const timeout = setTimeout(fetchApi, 500);
    return () => clearTimeout(timeout);
  }, [fromValue, fromUnit, toUnit, type, action, arithmeticOp, secondValue, secondUnit]);

  return (
    <div className="animate-slide-up">
      {action === "arithmetic" && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 mb-3 tracking-wide">
            ARITHMETIC OPERATION
          </p>
          <div className="flex gap-2">
            {["add", "subtract", "divide"].map((op) => (
              <button
                key={op}
                onClick={() => setArithmeticOp(op)}
                className={`
                  px-4 py-2 rounded font-medium text-sm transition-all duration-300
                  ${
                    arithmeticOp === op
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600"
                  }
                `}
              >
                {op === "add" ? "+" : op === "subtract" ? "−" : "÷"}
              </button>
            ))}
          </div>
        </div>
      )}

      {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {errorMsg}
          </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {/* FROM Section */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-4">
            {action === "arithmetic" || action === "comparison" ? "FIRST VALUE" : "FROM"}
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="
                text-3xl font-bold text-gray-900 bg-transparent
                border-b-2 border-gray-200 pb-2
                focus:border-blue-600 focus:outline-none
                transition-colors duration-200
              "
              placeholder="0"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="
                text-sm text-gray-600 bg-transparent
                border border-gray-200 rounded px-2 py-1
                focus:border-blue-600 focus:outline-none
                transition-colors duration-200
              "
            >
              {typeInfo.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TO/SECOND VALUE Section */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-4">
            {action === "arithmetic" || action === "comparison" ? "SECOND VALUE" : "TO"}
          </p>
          <div className="flex flex-col gap-3">
            {action === "arithmetic" || action === "comparison" ? (
              <>
                <input
                  type="number"
                  value={secondValue}
                  onChange={(e) => setSecondValue(e.target.value)}
                  className="
                    text-3xl font-bold text-gray-900 bg-transparent
                    border-b-2 border-gray-200 pb-2
                    focus:border-blue-600 focus:outline-none
                    transition-colors duration-200
                  "
                  placeholder="0"
                />
                <select
                  value={secondUnit}
                  onChange={(e) => setSecondUnit(e.target.value)}
                  className="
                    text-sm text-gray-600 bg-transparent
                    border border-gray-200 rounded px-2 py-1
                    focus:border-blue-600 focus:outline-none
                    transition-colors duration-200
                  "
                >
                  {typeInfo.units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">{isLoading ? "..." : toValue}</p>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="
                    text-sm text-gray-600 bg-transparent
                    border border-gray-200 rounded px-2 py-1
                    focus:border-blue-600 focus:outline-none
                    transition-colors duration-200
                  "
                >
                  {typeInfo.units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {action === "arithmetic" && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1">RESULT</p>
              <p className="text-4xl font-bold text-green-900">{isLoading ? "..." : toValue}</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs font-semibold text-green-700 mb-2">RESULT UNIT</p>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="
                  text-sm font-medium text-green-800 bg-white
                  border border-green-200 rounded px-3 py-1.5
                  focus:border-green-500 focus:outline-none
                  transition-all duration-200 shadow-sm
                "
              >
                {typeInfo.units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-green-600 italic">
            Computed as: {fromValue} {fromUnit} {
              arithmeticOp === "add" ? "+" :
              arithmeticOp === "subtract" ? "-" : "/"
            } {secondValue} { (arithmeticOp === "add" || arithmeticOp === "subtract") ? secondUnit : "" }
          </p>
        </div>
      )}

      {action === "comparison" && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-1">COMPARISON RESULT</p>
              <p className="text-4xl font-bold text-blue-900">{isLoading ? "..." : toValue}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 italic">
            Comparing: {fromValue} {fromUnit} vs {secondValue} {secondUnit}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedType, setSelectedType] = useState("LengthUnit");
  const [selectedAction, setSelectedAction] = useState("conversion");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Welcome To Quantity Measurement
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="
                px-4 py-2 bg-white bg-opacity-20 rounded-lg
                hover:bg-opacity-30 transition-all duration-300
                text-sm font-medium
              "
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <TypeSelector
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

        <ActionSelector
          selectedAction={selectedAction}
          onActionChange={setSelectedAction}
        />

        <ConversionInterface type={selectedType} action={selectedAction} />
      </div>
    </div>
  );
}
