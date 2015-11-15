const cx = React.addons.classSet;
const _ = lodash;

// Could probably do a better job simplifying the actions
DrawingContent = React.createClass({
  propTypes: {
    drawing: React.PropTypes.array.isRequired,
    editing: React.PropTypes.bool
  },

  handleLikeDrawing() {
    console.log('click like');
    if(_.contains(this.props.likedBy, Meteor.userId())) {
      Meteor.call('unlikeDrawing', args: {
        drawingId: this.props.drawing._id,
        currentUserId: Meteor.userId()
      });
    } else {
      Meteor.call('likeDrawing', args: {
        drawingId: this.props.drawing._id,
        currentUserId: Meteor.userId()
      });
    }
  },

  handleCellClick(event) {
    console.log('cell click');

    // To change the color of a cell, we get the cell array for the drawing,
    // update the array, and then shove it back into the Drawings collection
    const newCellIndex = $(event.target).index();
    const newCellColor = Session.get('currentColor');
    cells.splice(newCellIndex, 1, newCellColor);

    Meteor.call('updateDrawing', args: {
      drawingId: Session.get('currentDrawing'),
      cells: this.props.drawing.cells
    });
  },

  handleDoneEditing() {
    console.log('done editing');
    // TODO: Session could be this.state
    Session.set('currentDrawing', null);
  },

  handleEditDrawing() {
    console.log('edit');
    // TODO: Session could be this.state
    Session.set('currentDrawing', this.props.drawing._id);
  },

  handleDrawingClick() {
    console.log('drawing click');
    if(!Session.get('currentDrawing')) {
      // TODO: update flow router syntax
      Router.go('singleDrawing', {_id: this._id});
    }
  },

  handleDeleteDrawing() {
    console.log('delete drawing');
    if(window.confirm('Are you sure you want to delete this drawing?')) {
      Meteor.call('deleteDrawing', this._id);
    };
  },

  render() {
    let {drawing, editing} = this.props;
    let currentUser = Meteor.user();
    let drawingClassName = cx({
      'drawing-container': true,
      'editing': editing
    });

    return (
      <div className={drawingClassName}>
        <aside className="column left">
          <ul>
            <li>
              <strong>{drawing.ownerName} <Icon name="user"/></strong>
            </li>
            <li>
              <small>{drawing.createdAtTime} <Icon name="clock"/></small>
            </li>
            <li>
              {currentUser ?
                <a onClick={this.handleLikeDrawing}>
                  <small>
                    {this.drawing.likeCount ? `${drawing.likeCount} ` : 'Like it '}
                    <Icon name="heart"/>
                  </small>
                </a>
              :
                <small>{drawing.likeCount} <Icon name="heart"/></small>
              }
            </li>
          </ul>
        </aside>
        <div className="drawing" onClick={this.handleDrawingClick}>
          {drawing.cells.map((color, i) => {
            return <div className={`cell cell-${color}`} key={i} onClick={this.handleCellClick}>;
          })}
        </div>
        <aside className="column right">
          {editing ?
            <Swatches/>
            <a onClick={this.handleDoneEditing}>
              <strong><Icon name="file"/> Done</strong>
            </a>
          :
            <ul>
              <li>
                <a className="drawing-edit" onClick={this.handleEditDrawing}><strong><Icon name="edit"/> Edit</strong></a>
              </li>
              <li>
                <a className="bad" onClick={this.handleDeleteDrawing}><small><Icon name="trash"/> Delete</small></a>
              </li>
            </ul>
          }
        </aside>
      </div>
    );
  }
});

if(Meteor.isServer) {
  Meteor.methods({
    likeDrawing(args) {
      check(args, {
        drawingId: String,
        currentUserId: String
      });

      Drawings.update(args.drawingId, {
        $push: {likedBy: args.currentUserId}
      });
    },

    unlikeDrawing(args) {
      check(args, {
        drawingId: String,
        currentUserId: String
      });

      Drawings.update(args.drawingId, {
        $pull: {likedBy: args.currentUserId}
      });
    },

    updateDrawing(args) {
      check(args, {
        drawingId: String,
        cells: Array
      });

      Drawings.update(args.drawingId, {
        $set: {cells: args.cells}
      });
    },

    deleteDrawing(drawingId) {
      check(drawingId, String);

      Drawings.remove(drawingId);
    }
  });
}