class PagesController < ApplicationController
  # Renders the main HTML shell. The React app mounts on the
  # <div id="root"> that's provided by app/views/layouts/application.html.erb.
  def index
    # Intentionally render the default view (app/views/pages/index.html.erb)
    # which is empty except for a noscript fallback. The layout contains
    # the <div id="root"> mount point and includes the JS bundle.
    render :index
  end
end
