var _      = require('lodash'),
    utils  = require('../../utils'),
    yeoman = require('yeoman-generator');

var LogGenerator = yeoman.Base.extend({
  banner: utils.banner(),

  initializing: utils.promptGeneralConfig,

  /**
   * Prompts all required data and feeds the generator config
   */
  prompting: require('./prompting'),

  _getTemplateData: function() {
    return _.assign(
      _.mapKeys(this.currentCPT, function(value, key) { return 'cpt_' + key; }),
      this.config.getAll()
    );
  },

  /**
   * Copies all templates inside `base/` to the new folder and then adds plugin_name.php with its
   * actual name.
   */
  writing: {
    copyFromTemplate: function() {
      var config = this._getTemplateData();

      this.fs.copyTpl(
        this.templatePath('post_type_class.php'),
        this.destinationPath('lib/PostType/' + config['post_type_class'] + '.php'),
        config
      );

      if (!this.fs.exists(this.templatePath('PostType.php'))) {
        this.fs.copyTpl(
          this.templatePath('PostType.php'),
          this.destinationPath('lib/PostType.php'),
          config
        );
      }

      this.fs.copyTpl(
        this.templatePath('post_type_test_name.test.php'),
        this.destinationPath('test/phpunit/' + config['post_type_test_name'] + '.test.php'),
        config
      );
    }
  },

  _getDiff() {
    var diff = _.template(this.fs.read(this.templatePath('register_post_types.txt')));
    return diff(this._getTemplateData());
  },

  /**
   * Saves configs
   */
  end: function() {
    console.log('\n\nApply the following changes to lib/Plugin.php (if your plugin were generated by log-wp-plugin)\n\n');
    console.log(this._getDiff());

    this.config.save();
    console.log('\n\n')
    console.log('PostType `'+ this.currentCPT.slug +'` have been added ' + this.config.get('text_domain'));
  }
});

module.exports = LogGenerator;
