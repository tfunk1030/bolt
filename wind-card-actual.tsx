import React from 'react';

const WindCard = () => {
  const createSection = (yardage) => {
    // Get corresponding data for each yardage
    const getData = () => {
      const data = {
        80: {
          into: [-1.6, -3.8, -6.2, -8.9],
          quarterInto: [-1.1, -2.6, -4.4, -6.3],
          cross: [1.8, 4.1, 6.7, 9.5],
          quarterHelp: [1.4, 3.3, 5.5, 7.9],
          help: [2.0, 4.7, 7.8, 11.1]
        },
        100: {
          into: [-2.0, -4.9, -8.2, -11.7],
          quarterInto: [-1.4, -3.5, -5.8, -8.3],
          cross: [2.3, 5.4, 8.7, 12.4],
          quarterHelp: [1.9, 4.4, 7.2, 10.3],
          help: [2.6, 6.2, 10.2, 14.5]
        },
        120: {
          into: [-2.6, -6.0, -9.9, -14.1],
          quarterInto: [-1.8, -4.2, -7.0, -10.0],
          cross: [2.8, 6.3, 10.3, 14.5],
          quarterHelp: [2.1, 5.1, 8.5, 12.2],
          help: [3.0, 7.3, 12.1, 17.3]
        },
        140: {
          into: [-2.9, -6.8, -11.2, -16.0],
          quarterInto: [-2.1, -4.8, -7.9, -11.3],
          cross: [3.0, 6.9, 11.3, 15.9],
          quarterHelp: [2.4, 5.8, 9.7, 13.9],
          help: [3.5, 8.3, 13.7, 19.7]
        },
        160: {
          into: [-3.1, -7.3, -12.1, -17.3],
          quarterInto: [-2.2, -5.2, -8.6, -12.2],
          cross: [2.7, 6.2, 10.1, 14.3],
          quarterHelp: [2.6, 6.3, 10.5, 15.0],
          help: [3.8, 8.9, 14.8, 21.3]
        },
        180: {
          into: [-3.6, -8.4, -13.9, -19.9],
          quarterInto: [-2.5, -6.0, -9.8, -14.1],
          cross: [2.9, 6.6, 10.8, 15.2],
          quarterHelp: [3.1, 7.3, 12.1, 17.3],
          help: [4.3, 10.3, 17.1, 24.5]
        },
        200: {
          into: [-3.5, -8.2, -13.6, -19.5],
          quarterInto: [-2.5, -5.8, -9.6, -13.8],
          cross: [3.2, 7.4, 12.1, 17.1],
          quarterHelp: [3.0, 7.1, 11.9, 17.0],
          help: [4.3, 10.1, 16.8, 24.0]
        },
        220: {
          into: [-3.3, -7.7, -12.8, -18.4],
          quarterInto: [-2.3, -5.5, -9.1, -13.0],
          cross: [3.4, 7.7, 12.5, 17.7],
          quarterHelp: [2.8, 6.8, 11.2, 16.0],
          help: [4.0, 9.6, 15.8, 22.7]
        },
        240: {
          into: [-3.7, -8.7, -14.4, -20.6],
          quarterInto: [-2.6, -6.2, -10.2, -14.6],
          cross: [3.3, 7.7, 12.5, 17.6],
          quarterHelp: [3.2, 7.6, 12.6, 18.0],
          help: [4.5, 10.8, 17.8, 25.5]
        },
        260: {
          into: [-3.6, -8.6, -14.3, -20.5],
          quarterInto: [-2.6, -6.1, -10.1, -14.5],
          cross: [3.2, 7.5, 12.1, 17.2],
          quarterHelp: [3.2, 7.6, 12.5, 17.9],
          help: [4.5, 10.7, 17.7, 25.3]
        },
        280: {
          into: [-4.1, -9.8, -16.2, -23.2],
          quarterInto: [-2.9, -6.9, -11.5, -16.4],
          cross: [3.2, 7.3, 11.8, 16.7],
          quarterHelp: [3.6, 8.6, 14.2, 20.3],
          help: [5.1, 12.1, 20.1, 28.7]
        },
        300: {
          into: [-4.5, -10.6, -17.6, -25.2],
          quarterInto: [-3.1, -7.5, -12.4, -17.8],
          cross: [3.4, 7.9, 12.8, 18.1],
          quarterHelp: [3.9, 9.3, 15.4, 22.0],
          help: [5.6, 13.2, 21.8, 31.2]
        }
      };
      return data[yardage];
    };

    const data = getData();

    return (
      <div className="border-b border-gray-300">
        <div className="bg-yellow-100 py-0.5 px-2 text-xs font-bold border-b border-gray-400">
          {yardage}
        </div>
        
        {/* Into Wind Row */}
        <div className="bg-red-50 grid grid-cols-5 border-b border-gray-200">
          <div className="text-left px-2 py-0.5 text-xs">Into</div>
          {data.into.map((val, i) => (
            <div key={i} className="text-center py-0.5 text-xs border-l border-gray-200">{val}</div>
          ))}
        </div>
        
        {/* Quarter Into Row */}
        <div className="bg-red-50/60 grid grid-cols-5 border-b border-gray-200">
          <div className="text-left px-2 py-0.5 text-xs">Quarter Into</div>
          {data.quarterInto.map((val, i) => (
            <div key={i} className="text-center py-0.5 text-xs border-l border-gray-200">{val}</div>
          ))}
        </div>
        
        {/* Cross Row */}
        <div className="bg-blue-50 grid grid-cols-5 border-b border-gray-200">
          <div className="text-left px-2 py-0.5 text-xs">Cross</div>
          {data.cross.map((val, i) => (
            <div key={i} className="text-center py-0.5 text-xs border-l border-gray-200">{val}</div>
          ))}
        </div>
        
        {/* Quarter Help Row */}
        <div className="bg-green-50/60 grid grid-cols-5 border-b border-gray-200">
          <div className="text-left px-2 py-0.5 text-xs">Quarter Help</div>
          {data.quarterHelp.map((val, i) => (
            <div key={i} className="text-center py-0.5 text-xs border-l border-gray-200">{val}</div>
          ))}
        </div>
        
        {/* Help Row */}
        <div className="bg-green-50 grid grid-cols-5 border-b border-gray-200">
          <div className="text-left px-2 py-0.5 text-xs">Help</div>
          {data.help.map((val, i) => (
            <div key={i} className="text-center py-0.5 text-xs border-l border-gray-200">{val}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="font-mono">
      {/* Side 1: 80-180 yards */}
      <div className="p-2 pb-8 border-b-2 border-gray-800">
        <div className="border border-gray-300 rounded overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 bg-gray-800 text-white text-xs">
            <div className="px-2 py-1">MPH →</div>
            <div className="text-center py-1 border-l border-gray-500">5</div>
            <div className="text-center py-1 border-l border-gray-500">10</div>
            <div className="text-center py-1 border-l border-gray-500">15</div>
            <div className="text-center py-1 border-l border-gray-500">20</div>
          </div>
          
          {[80, 100, 120, 140, 160, 180].map(yards => createSection(yards))}
        </div>
      </div>

      {/* Side 2: 200-300 yards */}
      <div className="p-2 pt-8">
        <div className="border border-gray-300 rounded overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 bg-gray-800 text-white text-xs">
            <div className="px-2 py-1">MPH →</div>
            <div className="text-center py-1 border-l border-gray-500">5</div>
            <div className="text-center py-1 border-l border-gray-500">10</div>
            <div className="text-center py-1 border-l border-gray-500">15</div>
            <div className="text-center py-1 border-l border-gray-500">20</div>
          </div>
          
          {[200, 220, 240, 260, 280, 300].map(yards => createSection(yards))}
        </div>

        {/* Legend */}
        <div className="mt-2 text-xs space-y-1">
          <div className="font-bold">Key:</div>
          <div className="grid grid-cols-4 gap-1">
            <div className="bg-red-50 px-2 py-0.5 rounded text-center">Into (-)</div>
            <div className="bg-blue-50 px-2 py-0.5 rounded text-center">Cross</div>
            <div className="bg-green-50/60 px-2 py-0.5 rounded text-center">Quarter</div>
            <div className="bg-green-50 px-2 py-0.5 rounded text-center">Help (+)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindCard;