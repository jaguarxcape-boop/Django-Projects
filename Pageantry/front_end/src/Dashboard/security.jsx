export default function Security() {
  return (
    <div>
      <h2>Security</h2>

      <form>
        <label>
          Current Password
          <input type="password" />
        </label>

        <label>
          New Password
          <input type="password" />
        </label>

        <button>Update Password</button>
      </form>
    </div>
  );
}
