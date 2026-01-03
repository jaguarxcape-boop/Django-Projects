import StatCard from "../../components/StatCard";

export default function DashboardHome() {
  return (
    <>
      <h1>Organizer Dashboard</h1>

      <div className="stats-grid">
        <StatCard title="Events" value="3" />
        <StatCard title="Contestants" value="24" />
        <StatCard title="Total Votes" value="12,430" />
      </div>
    </>
  );
}
