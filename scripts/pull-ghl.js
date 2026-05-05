/**
 * pull-ghl.js — Pull GoHighLevel data
 * Returns: new contacts, pipeline activity, conversations
 *
 * Requires env: GHL_API_KEY
 */

const BASE = 'https://services.leadconnectorhq.com';

async function ghl(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

function getDateRange() {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthEnd = new Date(firstOfThisMonth - 1);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  return { startDate: lastMonthStart.toISOString(), endDate: firstOfThisMonth.toISOString() };
}

async function pullGHL(locationId) {
  if (!locationId || locationId === 'FILL_IN') {
    console.log('[GHL] No location ID configured — skipping');
    return null;
  }
  if (!process.env.GHL_API_KEY) {
    console.log('[GHL] No API key — skipping');
    return null;
  }

  const { startDate, endDate } = getDateRange();

  // New contacts this month
  const contacts = await ghl(
    `/contacts/?locationId=${locationId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&limit=100`
  );

  const newContacts = contacts.contacts?.length || contacts.count || 0;

  // Pipeline opportunities
  const pipelines = await ghl(`/opportunities/pipelines?locationId=${locationId}`);
  const pipelineList = pipelines.pipelines || [];

  const pipelineSummary = [];
  for (const pipeline of pipelineList.slice(0, 3)) {
    const opps = await ghl(
      `/opportunities/search?location_id=${locationId}&pipeline_id=${pipeline.id}&date_added__gte=${startDate}&date_added__lte=${endDate}`
    );
    pipelineSummary.push({
      name:  pipeline.name,
      count: opps.opportunities?.length || opps.count || 0
    });
  }

  console.log(`[GHL] newContacts=${newContacts} pipelines=${pipelineSummary.length}`);

  return { newContacts, pipelines: pipelineSummary };
}

module.exports = { pullGHL };
