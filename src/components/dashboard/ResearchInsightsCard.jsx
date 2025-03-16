// src/components/dashboard/ResearchInsightsCard.jsx
import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const ResearchInsightsCard = () => {
  const [expanded, setExpanded] = useState(false);
  
  // Research insights data
  const insights = [
    {
      title: "Invisible Labor Impact",
      description: "Uneven distribution of invisible labor (mental load) is a leading cause of relationship strain in 78% of couples with young children.",
      source: "Journal of Family Psychology, 2023",
      link: "#"
    },
    {
      title: "Child Development Effects",
      description: "Children who observe balanced household responsibilities are 65% more likely to form equitable partnerships in adulthood.",
      source: "Developmental Psychology Quarterly, 2022",
      link: "#"
    },
    {
      title: "Communication Benefits",
      description: "Couples who discuss workload balance weekly report 43% higher relationship satisfaction scores.",
      source: "Journal of Couple & Relationship Therapy, 2024",
      link: "#"
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <BookOpen className="text-purple-600 mr-2" size={20} />
          <h3 className="text-lg font-medium">Research Insights</h3>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </div>
      
      {expanded && (
        <div className="p-6 pt-0">
          <p className="text-sm text-gray-600 mb-4">
            Research-backed insights that inform Allie's recommendations
          </p>
          
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-1">{insight.title}</h4>
                <p className="text-sm text-purple-700 mb-2">{insight.description}</p>
                <div className="flex items-center text-xs text-purple-600">
                  <span>Source: {insight.source}</span>
                  <a href={insight.link} className="ml-2 flex items-center hover:underline">
                    Read more
                    <ExternalLink size={10} className="ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchInsightsCard;